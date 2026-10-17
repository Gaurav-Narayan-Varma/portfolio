export type Heading = {
  id: string;
  text: string;
  /** 2 for `#`/`##`, 3 for `###` (articles render `#` as an h2). */
  level: 2 | 3;
};

/** Removes inline markdown (links, emphasis, code) from a heading line. */
function plainText(markdown: string) {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/**
 * Pulls `#`, `##` and `###` headings out of article markdown (skipping code
 * fences) and assigns each a unique, URL-safe id. Order matches the order the
 * headings are rendered in, which `ArticleMarkdown` relies on.
 */
export function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;

    const text = plainText(match[2]);
    if (!text) continue;

    const base = slugify(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);

    headings.push({
      id: count === 0 ? base : `${base}-${count + 1}`,
      text,
      level: match[1].length === 3 ? 3 : 2,
    });
  }

  return headings;
}
