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

/** Where the visitor came from: UTM tags first, then the referring site. */
function sourceOf(rows: Row[]) {
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
      return clean(
        [source, medium, campaign].filter(Boolean).join(" / ")
      );
    }
  }

  for (const row of rows) {
    const domain = str(row.referring_domain);
    if (domain && domain !== "$direct" && domain !== OWN_HOST) {
      return clean(domain);
    }
  }
  return "Direct";
}

const pageName = (path: string) => (path === "/" ? "/ (home)" : path);

const EVENT_LABELS: Record<string, string> = {
  resume_downloaded: "Downloaded the resume",
  book_call_clicked: "Clicked Book a call",
  message_me_clicked: "Clicked Message me",
  contact_form_submitted: "Submitted the contact form",
  linkedin_clicked: "Clicked LinkedIn",
  github_clicked: "Clicked GitHub",
};

type Step = { ts: number; text: string };

function timelineOf(rows: Row[]): Step[] {
  const steps: Step[] = [];
  for (const row of rows) {
    const event = String(row.event);
    let text: string | undefined;

    if (event === "$pageview") {
      const path = pathOf(row);
      if (path) text = `Viewed ${pageName(path)}`;
    } else if (event === "gauravgpt_question") {
      const question = clean(str(row.question) ?? "(empty)", 300);
      const notes = [
        row.unanswered === true ? "couldn't answer" : undefined,
        str(row.status) && row.status !== "ok"
          ? `${row.status}`
          : undefined,
      ].filter(Boolean);
      text = `Asked GauravGPT: "${question}"${notes.length ? ` (${notes.join(", ")})` : ""}`;
    } else if (event === "gauravgpt_blocked") {
      text = `Hit a GauravGPT limit (${clean(str(row.reason) ?? "unknown", 40)})`;
    } else if (EVENT_LABELS[event]) {
      const where = str(row.location);
      text = `${EVENT_LABELS[event]}${where ? ` (${clean(where, 40)})` : ""}`;
    } else if (!event.startsWith("$")) {
      text = clean(event, 60);
    }

    if (!text) continue;
    // Collapse a refresh or repeat into the previous identical step.
    if (steps.at(-1)?.text === text) continue;
    steps.push({ ts: Number(row.ts), text });
  }
  return steps;
}

export type Summary = {
  subject: string;
  html: string;
  text: string;
  hasPageview: boolean;
};

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
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: TIME_ZONE,
  });

export function summarize(session: Session): Summary {
  const { rows } = session;
  const steps = timelineOf(rows);
  const hasPageview = rows.some((row) => row.event === "$pageview");

  const source = sourceOf(rows);
  const pages = new Set(
    rows.filter((r) => r.event === "$pageview").map((r) => pathOf(r))
  );
  pages.delete(undefined);
  const questions = rows.filter((r) => r.event === "gauravgpt_question").length;
  const downloadedResume = rows.some((r) => r.event === "resume_downloaded");
  const minutes = Math.max(1, Math.round((session.end - session.start) / 60));

  const first = rows[0];
  const device = [str(first.device), str(first.browser), str(first.os)]
    .filter(Boolean)
    .map((v) => clean(v as string, 40))
    .join(" · ");
  const country = str(first.country);

  const landing = rows.find((r) => r.event === "$pageview");
  const facts: [string, string][] = [
    ["Came from", source],
    ["Landed on", landing ? pageName(pathOf(landing) ?? "?") : "?"],
    ["When", `${day(session.start)}, ${clock(session.start)}`],
    ["Time on site", `${minutes} min`],
    ["Pages viewed", String(pages.size)],
    ["Downloaded resume", downloadedResume ? "Yes" : "No"],
    ["GauravGPT questions", String(questions)],
    ...(device ? ([["Device", device]] as [string, string][]) : []),
    ...(country ? ([["Country", clean(country, 40)]] as [string, string][]) : []),
  ];

  const highlights = [
    `${pages.size} page${pages.size === 1 ? "" : "s"}`,
    downloadedResume ? "downloaded resume" : undefined,
    questions
      ? `asked ${questions} question${questions === 1 ? "" : "s"}`
      : undefined,
  ].filter(Boolean);
  const subject = `Visitor from ${source}: ${highlights.join(", ")}`;

  const text = [
    ...facts.map(([k, v]) => `${k}: ${v}`),
    "",
    "What they did:",
    ...steps.map((s) => `  ${clock(s.ts)}  ${s.text}`),
  ].join("\n");

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#111;max-width:600px">
<table style="border-collapse:collapse;margin-bottom:16px">
${facts
  .map(
    ([k, v]) =>
      `<tr><td style="padding:3px 16px 3px 0;color:#666">${escapeHtml(k)}</td><td style="padding:3px 0"><b>${escapeHtml(v)}</b></td></tr>`
  )
  .join("\n")}
</table>
<div style="font-weight:600;margin-bottom:6px">What they did</div>
<table style="border-collapse:collapse">
${steps
  .map(
    (s) =>
      `<tr><td style="padding:3px 14px 3px 0;color:#888;white-space:nowrap;vertical-align:top">${escapeHtml(clock(s.ts))}</td><td style="padding:3px 0">${escapeHtml(s.text)}</td></tr>`
  )
  .join("\n")}
</table>
</div>`;

  return { subject, html, text, hasPageview };
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
