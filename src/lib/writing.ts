import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Articles live as markdown files in `content/writing/`. The filename (minus
 * `.md`) is the URL slug: `content/writing/my-post.md` -> `/writing/my-post`.
 * See `content/writing/README.md` for the frontmatter format.
 */
const WRITING_DIR = path.join(process.cwd(), "content", "writing");

export type ArticleMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  category: string;
  /** Optional cover image path (e.g. /writing/my-cover.jpg) */
  image?: string;
  readingTimeMinutes: number;
};

export type Article = ArticleMeta & { content: string };

function toIsoDate(value: unknown, file: string): string {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `content/writing/${file}: "date" is required and must look like 2026-01-31`
    );
  }
  return date.toISOString().slice(0, 10);
}

function requireString(value: unknown, field: string, file: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`content/writing/${file}: "${field}" is required`);
  }
  return value.trim();
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}

function parseArticle(file: string): Article | null {
  const raw = fs.readFileSync(path.join(WRITING_DIR, file), "utf8");
  const { data, content } = matter(raw);

  // `draft: true` keeps a post out of the site while you're writing it.
  if (data.draft === true) return null;

  return {
    slug: file.replace(/\.md$/, ""),
    title: requireString(data.title, "title", file),
    description: requireString(data.description, "description", file),
    date: toIsoDate(data.date, file),
    category: typeof data.category === "string" ? data.category.trim() : "General",
    image:
      typeof data.image === "string" && data.image.trim()
        ? data.image.trim()
        : undefined,
    readingTimeMinutes: readingTime(content),
    content,
  };
}

/** All published articles, newest first. */
export function getAllArticles(): Article[] {
  if (!fs.existsSync(WRITING_DIR)) return [];
  return fs
    .readdirSync(WRITING_DIR)
    .filter((file) => file.endsWith(".md") && file.toLowerCase() !== "readme.md")
    .map(parseArticle)
    .filter((article): article is Article => article !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function formatArticleDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
