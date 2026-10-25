import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import { claimOnce, releaseClaim } from "@/server/rate-limit";

/**
 * Emails Gaurav a summary of each site visit once it has ended.
 *
 * A "visit" is a PostHog session (browser events plus the GauravGPT question
 * events, which carry the same session id). A summary can only exist after
 * the visit is over, so a scheduled job (see .github/workflows/visitor-digest.yml)
 * calls `sendVisitorDigests()` every ~15 minutes. Each run:
 *   1. pulls the last few hours of events from PostHog (HogQL query API),
 *   2. groups them by session,
 *   3. picks sessions idle for 30+ minutes (PostHog's own session timeout),
 *   4. emails one summary per session, never twice (Redis claim per session).
 *
 * Needs POSTHOG_PERSONAL_API_KEY (a personal key with query read access, not
 * the `phc_` project key) and POSTHOG_PROJECT_ID, plus RESEND_API_KEY and Redis.
 */

const LOOKBACK_HOURS = 6;
/** PostHog ends a session after 30 minutes without events. */
const IDLE_MINUTES = 30;
/** Flood guard after an outage or first deploy; the rest go out next run. */
const MAX_EMAILS_PER_RUN = 15;
const CLAIM_TTL_SECONDS = 60 * 60 * 24 * 14;

const TO = "gaurav.narayan.varma@gmail.com";
const FROM = "gaurav <gaurav@gaurav-v.com>";
const TIME_ZONE = "America/Los_Angeles";

/* ------------------------------ PostHog query ------------------------------ */

const COLUMNS = [
  "session_id",
  "ts",
  "event",
  "url",
  "pathname",
  "referring_domain",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "question",
  "answer",
  "status",
  "unanswered",
  "reason",
  "location",
  "label",
  "device",
  "browser",
  "os",
  "country",
] as const;

type Row = Record<(typeof COLUMNS)[number], string | number | boolean | null>;

const QUERY = `
SELECT
  properties.$session_id,
  toUnixTimestamp(timestamp),
  event,
  properties.$current_url,
  properties.$pathname,
  properties.$referring_domain,
  properties.utm_source,
  properties.utm_medium,
  properties.utm_campaign,
  properties.question,
  properties.answer,
  properties.status,
  properties.likely_unanswered,
  properties.reason,
  properties.location,
  properties.label,
  properties.$device_type,
  properties.$browser,
  properties.$os,
  properties.$geoip_country_name
FROM events
WHERE timestamp > now() - INTERVAL ${LOOKBACK_HOURS} HOUR
  AND properties.$session_id IS NOT NULL
  AND properties.$session_id != ''
ORDER BY timestamp ASC
LIMIT 10000
`;

/** PostHog's app host (queries), derived from the ingest host if not set. */
function appHost() {
  return (
    process.env.POSTHOG_APP_HOST ??
    (process.env.POSTHOG_HOST ?? "https://us.i.posthog.com").replace(
      /^(https?:\/\/)([\w-]+)\.i\./,
      "$1$2."
    )
  ).replace(/\/$/, "");
}

async function fetchRows(): Promise<Row[]> {
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  if (!projectId || !apiKey) {
    throw new Error(
      "Set POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY to send visitor summaries"
    );
  }

  const res = await fetch(`${appHost()}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "visitor-digest",
      query: { kind: "HogQLQuery", query: QUERY },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `PostHog query failed (${res.status}): ${(await res.text()).slice(0, 300)}`
    );
  }

  const data = (await res.json()) as { results?: unknown[][] };
  return (data.results ?? []).map((values) =>
    Object.fromEntries(
      COLUMNS.map((column, i) => [column, values[i] ?? null])
    ) as Row
  );
}

/* ------------------------------- Summarising ------------------------------- */

type Session = { id: string; start: number; end: number; rows: Row[] };

export function groupSessions(rows: Row[]): Session[] {
  const sessions = new Map<string, Session>();
  for (const row of rows) {
    const id = String(row.session_id);
    const ts = Number(row.ts);
    const session = sessions.get(id);
    if (session) {
      session.rows.push(row);
      session.start = Math.min(session.start, ts);
      session.end = Math.max(session.end, ts);
    } else {
      sessions.set(id, { id, start: ts, end: ts, rows: [row] });
    }
  }
  return [...sessions.values()];
}

const str = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

/** Strips control characters and caps length: values come from URLs/visitors. */
const clean = (value: string, max = 80) =>
  value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, max);

const OWN_HOST = (() => {
  try {
    return new URL(SITE_URL).hostname;
  } catch {
    return "";
  }
})();

function pathOf(row: Row) {
  const pathname = str(row.pathname);
  if (pathname) return pathname;
  const url = str(row.url);
  if (!url) return undefined;
  try {
    return new URL(url).pathname;
  } catch {
    return undefined;
  }
}

type Source = { name: string; detail?: string };

/** Where the visitor came from: UTM tags first, then the referring site. */
function sourceOf(rows: Row[]): Source | null {
  for (const row of rows) {
    let source = str(row.utm_source);
    let medium = str(row.utm_medium);
    let campaign = str(row.utm_campaign);

    // Fall back to the URL's query string if PostHog didn't lift the params.
    const url = str(row.url);
    if (!source && url?.includes("utm_")) {
      try {
        const params = new URL(url).searchParams;
        source = params.get("utm_source") ?? undefined;
        medium = params.get("utm_medium") ?? undefined;
        campaign = params.get("utm_campaign") ?? undefined;
      } catch {
        // ignore malformed URLs
      }
    }
    if (source) {
      const detail = [medium, campaign].filter(Boolean).join(", ");
      return {
        name: clean(source),
        detail: detail ? clean(detail) : undefined,
      };
    }
  }

  for (const row of rows) {
    const domain = str(row.referring_domain);
    if (domain && domain !== "$direct" && domain !== OWN_HOST) {
      return { name: clean(domain) };
    }
  }
  return null;
}

/** "a", "a and b", "a, b and c". */
function joinList(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

const pageLabel = (path: string) => (path === "/" ? "the home page" : path);

/** Click events worth mentioning, phrased as "They ...". */
const ACTION_PHRASES: [event: string, phrase: string][] = [
  ["resume_downloaded", "downloaded your resume"],
  ["book_call_clicked", "clicked Book a call"],
  ["message_me_clicked", "clicked Message me"],
  ["contact_form_submitted", "submitted the contact form"],
  ["linkedin_clicked", "clicked through to your LinkedIn"],
  ["github_clicked", "clicked through to your GitHub"],
  ["see_repo_clicked", "opened the site's GitHub repo"],
];

/** GauravGPT answers are markdown; flatten to plain prose for the email. */
function plainAnswer(answer: string, max = 1500) {
  const text = answer
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\*\*|__|`/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}...` : text;
}

export type Summary = {
  subject: string;
  html: string;
  text: string;
  hasPageview: boolean;
};

const SUBJECT = "New personal site visitor!";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clock = (seconds: number) =>
  new Date(seconds * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });

const day = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: TIME_ZONE,
  });

/** The visit written up as a few plain paragraphs (no lists or tables). */
export function summarize(session: Session): Summary {
  const { rows } = session;
  const pageviews = rows.filter((row) => row.event === "$pageview");
  const hasPageview = pageviews.length > 0;
  const has = (event: string) => rows.some((row) => row.event === event);

  const paragraphs: string[] = [];

  // 1. Who, when, from where.
  const source = sourceOf(rows);
  const minutes = Math.round((session.end - session.start) / 60);
  const length = minutes <= 1 ? "about a minute" : `about ${minutes} minutes`;
  const first = rows[0];
  const browser = str(first.browser);
  const os = str(first.os);
  const deviceType = str(first.device);
  const country = str(first.country);

  const intro = [
    `Someone visited your site on ${day(session.start)} at ${clock(session.start)} and spent ${length} on it.`,
    source
      ? `They came from ${source.name}${source.detail ? ` (${source.detail})` : ""}.`
      : "They arrived directly, with no referring site or tracking tags.",
  ];
  const where = [
    browser && os ? `${clean(browser, 40)} on ${clean(os, 40)}` : browser || os,
    deviceType ? `(${clean(deviceType, 20).toLowerCase()})` : undefined,
  ]
    .filter(Boolean)
    .map((part) => clean(String(part), 60))
    .join(" ");
  if (where || country) {
    intro.push(
      `They were using ${where || "an unknown browser"}${country ? `, in ${clean(country, 40)}` : ""}.`
    );
  }
  paragraphs.push(intro.join(" "));

  // 2. Pages, in the order they first opened them.
  const pages = [
    ...new Set(pageviews.map((row) => pathOf(row)).filter(Boolean) as string[]),
  ];
  if (pages.length) {
    const [landing, ...rest] = pages;
    const pageText = rest.length
      ? `They landed on ${pageLabel(landing)}, then looked at ${joinList(rest.map(pageLabel))}.`
      : `They only viewed ${pageLabel(landing)}.`;

    // 3. Clicks and downloads.
    const did = ACTION_PHRASES.filter(([event]) => has(event)).map(
      ([, phrase]) => phrase
    );
    const actionText = did.length
      ? `They ${joinList(did)}.${has("resume_downloaded") ? "" : " They did not download your resume."}`
      : "They did not download your resume or click any of your links.";

    paragraphs.push(`${pageText} ${actionText}`);
  }

  // 4. Each GauravGPT exchange, in order.
  const asked = rows.filter((row) => row.event === "gauravgpt_question");
  asked.forEach((row, i) => {
    const question = clean(str(row.question) ?? "(empty message)", 400);
    const answer = str(row.answer);
    const opener = i === 0 ? "They asked GauravGPT" : "They then asked";

    let text: string;
    if (answer) {
      text = `${opener} “${question}” and it replied: “${plainAnswer(answer)}”`;
      if (row.unanswered === true) {
        text += " GauravGPT said it didn't know the answer to this one.";
      }
    } else {
      const status = str(row.status);
      text = `${opener} “${question}”, but it didn't return an answer${status && status !== "ok" ? ` (${status})` : ""}.`;
    }
    paragraphs.push(text);
  });
  if (!asked.length) {
    paragraphs.push("They didn't ask GauravGPT anything.");
  }
  if (has("gauravgpt_blocked")) {
    paragraphs.push("They also ran into one of GauravGPT's usage limits.");
  }

  const text = paragraphs.join("\n\n");
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111;max-width:600px">
${paragraphs.map((p) => `<p style="margin:0 0 14px">${escapeHtml(p)}</p>`).join("\n")}
</div>`;

  return { subject: SUBJECT, html, text, hasPageview };
}

/* ---------------------------------- Runner ---------------------------------- */

export async function sendVisitorDigests() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);

  const rows = await fetchRows();
  const now = Date.now() / 1000;

  const finished = groupSessions(rows)
    .filter((session) => now - session.end >= IDLE_MINUTES * 60)
    .sort((a, b) => a.start - b.start);

  let sent = 0;
  let alreadySent = 0;
  let failed = 0;

  for (const session of finished) {
    if (sent >= MAX_EMAILS_PER_RUN) break;

    const summary = summarize(session);
    // Sessions with no page view are stray events (no real visit to report).
    if (!summary.hasPageview) continue;

    const claim = `visitor-digest:sent:${session.id}`;
    if (!(await claimOnce(claim, CLAIM_TTL_SECONDS))) {
      alreadySent++;
      continue;
    }

    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [TO],
        subject: summary.subject,
        html: summary.html,
        text: summary.text,
      });
      if (error) throw new Error(JSON.stringify(error));
      sent++;
    } catch (error) {
      // Let the next run retry this visit.
      await releaseClaim(claim);
      failed++;
      console.error("[visitor-digest] email failed:", error);
    }
  }

  return {
    sessionsInWindow: groupSessions(rows).length,
    finished: finished.length,
    sent,
    alreadySent,
    failed,
  };
}
