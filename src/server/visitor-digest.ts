import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import { claimOnce, releaseClaim } from "@/server/rate-limit";

/**
 * Emails Gaurav a summary of each site visit once it has ended.
 *
 * A "visit" is a PostHog session (browser events plus the GauravGPT question
 * events, which carry the same session id). A summary can only exist after
 * the visit is over, so a scheduled Inngest function (src/server/inngest/functions.ts)
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

/** Click events worth mentioning, shown as chips in the email. */
const ACTIONS: [event: string, label: string][] = [
  ["resume_downloaded", "Downloaded resume"],
  ["book_call_clicked", "Clicked Book a call"],
  ["message_me_clicked", "Clicked Message me"],
  ["contact_form_submitted", "Submitted contact form"],
  ["linkedin_clicked", "Clicked LinkedIn"],
  ["github_clicked", "Clicked GitHub"],
  ["see_repo_clicked", "Opened site repo"],
];

/** One line or bullet of a GauravGPT answer. */
type AnswerBlock = { kind: "p" | "li"; text: string };

/**
 * GauravGPT answers are markdown. Boil one down to paragraphs and bullets
 * (headings become plain paragraphs) and cap the total length, so the email can
 * show them as real lists instead of one run-on block.
 */
function answerBlocks(answer: string, max = 1500): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let used = 0;
  for (const raw of answer.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.match(/^(?:[-*+]|\d+[.)])\s+(.*)$/);
    const text = (bullet ? bullet[1] : line.replace(/^#{1,6}\s+/, "")).trim();
    if (!text) continue;
    if (used + text.length > max) {
      const room = max - used;
      if (room > 40) {
        blocks.push({
          kind: bullet ? "li" : "p",
          text: `${text.slice(0, room).trimEnd()}...`,
        });
      } else if (blocks.length) {
        blocks[blocks.length - 1].text += "...";
      }
      break;
    }
    used += text.length;
    blocks.push({ kind: bullet ? "li" : "p", text });
  }
  return blocks;
}

/** Inline markdown -> plain text ("**bold**" and `code` markers dropped). */
const plainInline = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*|__|`/g, "");

/** Inline markdown -> safe HTML (bold and code only; everything is escaped). */
const htmlInline = (text: string) =>
  escapeHtml(text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)"))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<code style="font-family:Menlo,Consolas,monospace;font-size:13px">$1</code>');

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

/** "today" / "yesterday", or the weekday and date if the visit is older. */
function dayWord(seconds: number) {
  const key = (ms: number) =>
    new Date(ms).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
  const visit = key(seconds * 1000);
  if (visit === key(Date.now())) return "today";
  if (visit === key(Date.now() - 24 * 60 * 60 * 1000)) return "yesterday";
  return `on ${day(seconds)}`;
}

const H = (label: string) =>
  `<div style="margin:26px 0 10px;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6b7280">${label}</div>`;

/**
 * The visit as an email: a short intro, the path they took drawn as a vertical
 * timeline, any clicks as chips, and each GauravGPT exchange as its own card
 * (question, then the answer with its bullets).
 */
export function summarize(session: Session): Summary {
  const { rows } = session;
  const pageviews = rows.filter((row) => row.event === "$pageview");
  const hasPageview = pageviews.length > 0;
  const has = (event: string) => rows.some((row) => row.event === event);

  // 1. Who, when, from where.
  const source = sourceOf(rows);
  const minutes = Math.round((session.end - session.start) / 60);
  const length = minutes <= 1 ? "about a minute" : `about ${minutes} minutes`;
  const first = rows[0];
  const country = str(first.country);

  const intro = [
    `Someone arrived at ${clock(session.start)} ${dayWord(session.start)} and spent ${length} on your site.`,
    source
      ? `They came from ${source.name}${source.detail ? ` (${source.detail})` : ""}.`
      : "They came directly, with no referring site or tracking tags.",
  ];
  if (country) intro.push(`They were in ${clean(country, 40)}.`);
  const introText = intro.join(" ");

  // 2. Path: each page once, in the order first opened, with the time.
  const steps: { path: string; at: number }[] = [];
  for (const row of pageviews) {
    const path = pathOf(row);
    if (path && !steps.some((step) => step.path === path)) {
      steps.push({ path, at: Number(row.ts) });
    }
  }
  const stepLabel = (path: string) => (path === "/" ? "Home" : path);

  const pathHtml = steps.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${steps
        .map((step, i) => {
          const last = i === steps.length - 1;
          return `<tr>
<td style="width:22px;vertical-align:top;text-align:center;padding:0">
<div style="width:10px;height:10px;border-radius:50%;background:${i === 0 ? "#10b981" : "#9ca3af"};margin:7px auto 0"></div>${last ? "" : '<div style="width:2px;height:26px;background:#d1d5db;margin:3px auto 0"></div>'}
</td>
<td style="padding:0 0 ${last ? 0 : 6}px 10px;vertical-align:top">
<span style="display:inline-block;padding:2px 10px;border:1px solid #e5e7eb;border-radius:999px;background:#f9fafb;font-family:Menlo,Consolas,monospace;font-size:13px;color:#111">${escapeHtml(stepLabel(step.path))}</span>
<span style="font-size:12px;color:#9ca3af;margin-left:8px">${i === 0 ? "landed " : ""}${clock(step.at)}</span>
</td>
</tr>`;
        })
        .join("")}</table>`
    : "";
  const pathText = steps
    .map((step, i) => `${i + 1}. ${stepLabel(step.path)} (${clock(step.at)})`)
    .join("\n");

  // 3. Clicks and downloads.
  const did = ACTIONS.filter(([event]) => has(event)).map(([, label]) => label);
  const actionsHtml = did.length
    ? did
        .map(
          (label) =>
            `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 10px;border-radius:999px;background:#d1fae5;color:#065f46;font-size:13px;font-weight:500">${escapeHtml(label)}</span>`
        )
        .join("")
    : '<span style="font-size:14px;color:#6b7280">No resume download or link clicks.</span>';
  const actionsText = did.length
    ? did.join(", ")
    : "No resume download or link clicks.";

  // 4. Each GauravGPT exchange, in order.
  const asked = rows.filter((row) => row.event === "gauravgpt_question");
  const exchanges = asked.map((row) => {
    const question = clean(str(row.question) ?? "(empty message)", 400);
    const answer = str(row.answer);
    const status = str(row.status);
    const blocks = answer ? answerBlocks(answer) : [];
    const unanswered = row.unanswered === true;

    const answerHtml = blocks.length
      ? (() => {
          const out: string[] = [];
          let list: string[] = [];
          const flush = () => {
            if (list.length) {
              out.push(
                `<ul style="margin:0 0 8px;padding-left:20px">${list.join("")}</ul>`
              );
              list = [];
            }
          };
          for (const block of blocks) {
            if (block.kind === "li") {
              list.push(`<li style="margin:0 0 4px">${htmlInline(block.text)}</li>`);
            } else {
              flush();
              out.push(`<p style="margin:0 0 8px">${htmlInline(block.text)}</p>`);
            }
          }
          flush();
          return out.join("");
        })()
      : `<p style="margin:0;color:#6b7280">No answer was returned${status && status !== "ok" ? ` (${escapeHtml(status)})` : ""}.</p>`;

    const html = `<div style="margin:0 0 14px;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb">
<div style="font-weight:600;margin:0 0 8px">${escapeHtml(question)}</div>
<div style="border-left:3px solid #10b981;padding:0 0 0 12px;color:#374151;font-size:14px">${answerHtml}${unanswered && blocks.length ? `<p style="margin:0;font-size:13px;color:#b45309">GauravGPT said it didn't know the answer to this one.</p>` : ""}</div>
</div>`;

    const text = [
      `Q: ${question}`,
      ...(blocks.length
        ? blocks.map((b) => (b.kind === "li" ? `  - ${plainInline(b.text)}` : `  ${plainInline(b.text)}`))
        : [`  (no answer returned${status && status !== "ok" ? `: ${status}` : ""})`]),
      ...(unanswered && blocks.length ? ["  (GauravGPT said it didn't know the answer.)"] : []),
    ].join("\n");
    return { html, text };
  });

  const blockedNote = has("gauravgpt_blocked")
    ? "They also ran into one of GauravGPT's usage limits."
    : "";

  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#111">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3">${SUBJECT}</h1>
<p style="margin:0">${escapeHtml(introText)}</p>
${steps.length ? `${H("Path")}${pathHtml}${H("Actions")}${actionsHtml}` : ""}
${H("GauravGPT")}
${exchanges.length ? exchanges.map((e) => e.html).join("\n") : '<p style="margin:0;color:#6b7280">They didn\'t ask GauravGPT anything.</p>'}
${blockedNote ? `<p style="margin:0;color:#b45309">${escapeHtml(blockedNote)}</p>` : ""}
</div>`;

  const text = [
    SUBJECT,
    introText,
    ...(steps.length ? [`PATH\n${pathText}`, `ACTIONS\n${actionsText}`] : []),
    `GAURAVGPT\n${exchanges.length ? exchanges.map((e) => e.text).join("\n\n") : "They didn't ask GauravGPT anything."}`,
    ...(blockedNote ? [blockedNote] : []),
  ].join("\n\n");

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
