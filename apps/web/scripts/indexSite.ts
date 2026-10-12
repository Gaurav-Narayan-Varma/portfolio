/**
 * Crawls the site (HTML pages + the resume PDF), chunks the text, and syncs it
 * to the Pinecone index that powers GauravGPT (/api/chat).
 *
 *   pnpm pc:index                          # crawl http://localhost:3001 (pnpm dev)
 *   pnpm pc:index --url https://my-site    # crawl a deployed site
 *   pnpm pc:index --dry-run                # print chunks, don't touch Pinecone
 *
 * Re-running is safe: records have deterministic ids, so they're overwritten,
 * and any record in the namespace that is no longer produced by the crawl is
 * deleted.
 */
import "dotenv/config";

import { parse, HTMLElement, Node, NodeType } from "node-html-parser";
import { extractText, getDocumentProxy } from "unpdf";
import { RESUME_PATH } from "../src/constants/resume";
import { getIndex } from "../src/server/pinecone";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urlArgIdx = args.indexOf("--url");
const BASE_URL = new URL(
  (urlArgIdx !== -1 ? args[urlArgIdx + 1] : undefined) ??
    process.env.SITE_URL ??
    "http://localhost:3001"
);

/** Pages we start from. "/" is enough for discovery through the navbar. */
const SEED_PATHS = ["/"];
/** Linked from JS only (the navbar builds the link on click), so seed it. */
const EXTRA_PATHS = [RESUME_PATH];
/** Pages that are UI chrome rather than content about Gaurav. */
const EXCLUDE_PATHS = ["/chat"];

const CHUNK_TARGET_CHARS = 900;
const CHUNK_MAX_CHARS = 1500;
const UPSERT_BATCH_SIZE = 96; // Pinecone integrated-embedding limit

type Page = { path: string; label: string; lines: string[] };

/* -------------------------------- crawling -------------------------------- */

function normalizePath(href: string, from: URL): string | null {
  let u: URL;
  try {
    u = new URL(href, from);
  } catch {
    return null;
  }
  if (u.origin !== BASE_URL.origin) return null;
  const path = u.pathname.replace(/\/+$/, "") || "/";
  if (path.startsWith("/_next") || path.startsWith("/api")) return null;
  if (EXCLUDE_PATHS.includes(path)) return null;
  const ext = path.split("/").pop()!.split(".")[1];
  if (ext && ext.toLowerCase() !== "pdf") return null; // images, videos, ...
  return path;
}

const BLOCK_TAGS = new Set([
  "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "BR", "DD", "DIV", "DL", "DT",
  "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4",
  "H5", "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "SECTION",
  "TABLE", "TD", "TH", "TR", "UL",
]);
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TEMPLATE", "VIDEO", "IFRAME"]);
const HEADING_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6"]);

/** Flattens an element into one string per block, e.g. one per paragraph. */
function htmlToLines(root: HTMLElement): string[] {
  const lines: string[] = [];
  let buf = "";

  const flush = () => {
    const text = buf.replace(/\s+/g, " ").trim();
    if (text) lines.push(text);
    buf = "";
  };

  const walk = (node: Node) => {
    if (node.nodeType === NodeType.TEXT_NODE) {
      buf += node.text;
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    if (SKIP_TAGS.has(node.tagName)) return;
    if (node.getAttribute("aria-hidden") === "true") return;

    const isBlock = BLOCK_TAGS.has(node.tagName);
    if (isBlock) flush();
    node.childNodes.forEach(walk);
    if (isBlock) flush();
  };

  walk(root);
  flush();
  return lines;
}

function labelFor(path: string): string {
  if (path === "/") return "Home";
  if (path === RESUME_PATH) return "Resume (PDF)";
  const last = path.split("/").pop()!;
  if (last.toLowerCase().endsWith(".pdf")) {
    return last.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ") + " (PDF)";
  }
  return path
    .split("/")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" / ");
}

async function crawl(): Promise<Page[]> {
  const queue = [...SEED_PATHS, ...EXTRA_PATHS];
  const seen = new Set(queue);
  const pages: Page[] = [];

  while (queue.length) {
    const path = queue.shift()!;
    const url = new URL(path, BASE_URL);

    const res = await fetch(url, { signal: AbortSignal.timeout(90_000) }).catch(
      (err) => {
        throw new Error(`Failed to fetch ${url}: ${err.message}`);
      }
    );
    if (!res.ok) {
      if (SEED_PATHS.includes(path)) {
        throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
      }
      console.warn(`  skip ${path} (HTTP ${res.status})`);
      continue;
    }

    const type = res.headers.get("content-type") ?? "";

    if (type.includes("application/pdf")) {
      const pdf = await getDocumentProxy(new Uint8Array(await res.arrayBuffer()));
      const { text } = await extractText(pdf, { mergePages: true });
      const lines = text
        .split("\n")
        .map((l) => l.replace(/\s+/g, " ").trim())
        .filter(Boolean);
      pages.push({ path, label: labelFor(path), lines });
      console.log(`  pdf  ${path} (${lines.length} lines)`);
      continue;
    }

    if (!type.includes("text/html")) continue;

    const root = parse(await res.text());

    // Discover links from the whole document (the navbar has most of them)...
    for (const a of root.querySelectorAll("a[href]")) {
      const next = normalizePath(a.getAttribute("href")!, url);
      if (next && !seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
    }

    // ...but only index <main>, to leave out navbars and the footer credit.
    const main = root.querySelector("main");
    if (!main) {
      console.warn(`  skip ${path} (no <main>)`);
      continue;
    }
    const lines = htmlToLines(main);
    pages.push({ path, label: labelFor(path), lines });
    console.log(`  html ${path} (${lines.length} lines)`);
  }

  return pages;
}

/* -------------------------------- chunking -------------------------------- */

/** Hard-splits an oversized line on sentence boundaries. */
function splitLongLine(line: string): string[] {
  if (line.length <= CHUNK_MAX_CHARS) return [line];
  const parts: string[] = [];
  let cur = "";
  for (const sentence of line.split(/(?<=[.!?])\s+/)) {
    if (cur && cur.length + sentence.length + 1 > CHUNK_MAX_CHARS) {
      parts.push(cur);
      cur = "";
    }
    cur = cur ? `${cur} ${sentence}` : sentence;
  }
  if (cur) parts.push(cur);
  return parts;
}

/**
 * Packs lines into chunks of roughly CHUNK_TARGET_CHARS. Chunks are never
 * split mid-line, and each is prefixed with the page label so it's
 * self-describing when retrieved on its own.
 */
function chunkPage(page: Page): string[] {
  const lines = page.lines.flatMap(splitLongLine);
  const chunks: string[] = [];
  let cur: string[] = [];
  let len = 0;

  const flush = () => {
    if (cur.length) chunks.push(`${page.label}\n${cur.join("\n")}`);
    cur = [];
    len = 0;
  };

  for (const line of lines) {
    if (len > 0 && len + line.length > CHUNK_TARGET_CHARS) flush();
    cur.push(line);
    len += line.length + 1;
  }
  flush();
  return chunks;
}

function slugFor(path: string): string {
  const slug = path
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "home";
}

/* --------------------------------- syncing -------------------------------- */

async function listAllIds(): Promise<string[]> {
  const index = getIndex();
  const ids: string[] = [];
  let paginationToken: string | undefined;
  do {
    const page = await index.listPaginated({ paginationToken });
    for (const v of page.vectors ?? []) if (v.id) ids.push(v.id);
    paginationToken = page.pagination?.next;
  } while (paginationToken);
  return ids;
}

async function main() {
  console.log(`Crawling ${BASE_URL.origin}${dryRun ? " (dry run)" : ""}`);
  const pages = await crawl();

  const records: {
    _id: string;
    text: string;
    source: string;
    label: string;
  }[] = [];
  const seenText = new Set<string>();

  for (const page of pages) {
    chunkPage(page).forEach((chunk, i) => {
      if (seenText.has(chunk)) return;
      seenText.add(chunk);
      records.push({
        _id: `${slugFor(page.path)}#${i}`,
        text: chunk,
        source: page.path,
        label: page.label,
      });
    });
  }

  console.log(`\n${pages.length} pages -> ${records.length} chunks`);

  if (dryRun) {
    for (const r of records) console.log(`\n--- ${r._id} (${r.text.length} chars)\n${r.text}`);
    return;
  }

  // Don't wipe a good index because of a bad crawl.
  if (pages.length === 0 || records.length === 0) {
    throw new Error("Crawl produced no content; leaving the index untouched.");
  }

  const index = getIndex();
  for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
    await index.upsertRecords(records.slice(i, i + UPSERT_BATCH_SIZE));
  }
  console.log(`Upserted ${records.length} records`);

  const keep = new Set(records.map((r) => r._id));
  const stale = (await listAllIds()).filter((id) => !keep.has(id));
  for (let i = 0; i < stale.length; i += 1000) {
    await index.deleteMany(stale.slice(i, i + 1000));
  }
  console.log(`Deleted ${stale.length} stale records`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
