/**
 * Finds a stock photo, saves it to public/writing/<slug>.jpg and points the
 * article's `image:` frontmatter at it.
 *
 *   pnpm writing:cover <slug> "laptop on desk"            # use the best match
 *   pnpm writing:cover <slug> "laptop on desk" --list     # preview options
 *   pnpm writing:cover <slug> "laptop on desk" --pick 3   # use option #3
 *   ... --provider pixabay                                # force a provider
 *
 * Providers (set at least one key in .env; Unsplash wins if both):
 *   UNSPLASH_ACCESS_KEY  https://unsplash.com/developers  (best photo quality)
 *   PIXABAY_API_KEY      https://pixabay.com/api/docs/    (instant free key)
 *
 * The photo is downloaded once and committed, so the site never calls these
 * APIs at build or run time and the cover can't change under you.
 */
import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(__dirname, "..");
const ARTICLES_DIR = path.join(ROOT, "content", "writing");
const IMAGES_DIR = path.join(ROOT, "public", "writing");

type Photo = {
  description: string;
  photographer: string;
  pageUrl: string;
  /** Direct URL of the image file to download. */
  imageUrl: string;
  /** Called once the photo is actually used (Unsplash requires this). */
  onDownload?: () => Promise<void>;
};

type Provider = {
  name: string;
  credit: string;
  search(query: string): Promise<Photo[]>;
};

function fail(message: string): never {
  console.error(`\n${message}\n`);
  process.exit(1);
}

async function getJson<T>(url: URL | string, headers?: HeadersInit): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) fail(`Request failed: HTTP ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

/* -------------------------------- providers -------------------------------- */

function unsplash(key: string): Provider {
  const base = process.env.UNSPLASH_API_URL ?? "https://api.unsplash.com";
  const headers = { Authorization: `Client-ID ${key}` };
  return {
    name: "Unsplash",
    credit: "Unsplash",
    async search(query) {
      const url = new URL(`${base}/search/photos`);
      url.searchParams.set("query", query);
      url.searchParams.set("orientation", "landscape");
      url.searchParams.set("per_page", "10");
      const { results } = await getJson<{
        results: {
          alt_description: string | null;
          description: string | null;
          urls: { raw: string };
          user: { name: string };
          links: { html: string; download_location: string };
        }[];
      }>(url, headers);
      return results.map((p) => ({
        description: p.alt_description || p.description || "",
        photographer: p.user.name,
        pageUrl: p.links.html,
        // `raw` already carries imgix params, so append ours.
        imageUrl: `${p.urls.raw}${p.urls.raw.includes("?") ? "&" : "?"}w=1600&q=80&fm=jpg&fit=max`,
        // Unsplash API guidelines: report a download when a photo is used.
        onDownload: async () => {
          await fetch(p.links.download_location, { headers });
        },
      }));
    },
  };
}

function pixabay(key: string): Provider {
  const base = process.env.PIXABAY_API_URL ?? "https://pixabay.com/api/";
  return {
    name: "Pixabay",
    credit: "Pixabay",
    async search(query) {
      const url = new URL(base);
      url.searchParams.set("key", key);
      url.searchParams.set("q", query.slice(0, 100));
      url.searchParams.set("image_type", "photo");
      url.searchParams.set("orientation", "horizontal");
      url.searchParams.set("min_width", "1280");
      url.searchParams.set("safesearch", "true");
      url.searchParams.set("order", "popular");
      url.searchParams.set("per_page", "10");
      const { hits } = await getJson<{
        hits: {
          tags: string;
          user: string;
          pageURL: string;
          largeImageURL: string;
        }[];
      }>(url);
      return hits.map((p) => ({
        description: p.tags,
        photographer: p.user,
        pageUrl: p.pageURL,
        imageUrl: p.largeImageURL,
      }));
    },
  };
}

function chooseProvider(requested: string | undefined): Provider {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pixabayKey = process.env.PIXABAY_API_KEY;

  if (requested && requested !== "unsplash" && requested !== "pixabay") {
    fail(`Unknown provider "${requested}". Use unsplash or pixabay.`);
  }
  if (requested === "unsplash" || (!requested && unsplashKey)) {
    if (!unsplashKey) fail("UNSPLASH_ACCESS_KEY is not set in .env");
    return unsplash(unsplashKey);
  }
  if (requested === "pixabay" || (!requested && pixabayKey)) {
    if (!pixabayKey) fail("PIXABAY_API_KEY is not set in .env");
    return pixabay(pixabayKey);
  }
  return fail(
    "No image API key found. Add one to .env:\n" +
      "  UNSPLASH_ACCESS_KEY=...   https://unsplash.com/developers (best quality)\n" +
      "  PIXABAY_API_KEY=...       https://pixabay.com/api/docs/ (instant free key)"
  );
}

/* ----------------------------------- cli ----------------------------------- */

const args = process.argv.slice(2);
const flagValue = (flag: string) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};
const list = args.includes("--list");
const pick = Number(flagValue("--pick") ?? 1);
const positional = args.filter(
  (a, i) =>
    !a.startsWith("--") && args[i - 1] !== "--pick" && args[i - 1] !== "--provider"
);
const [slug, query] = positional;

if (!slug || !query) {
  fail(
    'Usage: pnpm writing:cover <slug> "search query" [--list] [--pick N] [--provider unsplash|pixabay]'
  );
}
if (!Number.isInteger(pick) || pick < 1) fail("--pick must be 1 or higher");

const articlePath = path.join(ARTICLES_DIR, `${slug}.md`);
if (!fs.existsSync(articlePath)) {
  fail(`No article at content/writing/${slug}.md. Create it first.`);
}

/** Adds or replaces `image:` inside the frontmatter block only. */
function setImageFrontmatter(markdown: string, imagePath: string): string {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) fail(`content/writing/${slug}.md has no frontmatter block.`);
  const line = `image: ${imagePath}`;
  const frontmatter = /^image:.*$/m.test(match[1])
    ? match[1].replace(/^image:.*$/m, line)
    : `${match[1]}\n${line}`;
  return markdown.replace(match[1], () => frontmatter);
}

async function main() {
  const provider = chooseProvider(flagValue("--provider"));
  const photos = await provider.search(query);
  if (!photos.length) {
    fail(`No ${provider.name} results for "${query}". Try other words.`);
  }

  if (list) {
    console.log(`\n${provider.name} results for "${query}":\n`);
    photos.forEach((p, i) =>
      console.log(
        `  ${i + 1}. ${p.description || "(no description)"}\n     by ${p.photographer}  ${p.pageUrl}`
      )
    );
    console.log(`\nPick one with: pnpm writing:cover ${slug} "${query}" --pick N\n`);
    return;
  }

  const photo = photos[pick - 1];
  if (!photo) fail(`Only ${photos.length} results; --pick ${pick} is out of range.`);

  const imgRes = await fetch(photo.imageUrl);
  if (!imgRes.ok) fail(`Image download failed: HTTP ${imgRes.status}`);
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(IMAGES_DIR, `${slug}.jpg`),
    Buffer.from(await imgRes.arrayBuffer())
  );
  await photo.onDownload?.();

  fs.writeFileSync(
    articlePath,
    setImageFrontmatter(fs.readFileSync(articlePath, "utf8"), `/writing/${slug}.jpg`)
  );

  console.log(`\nSaved public/writing/${slug}.jpg and updated content/writing/${slug}.md`);
  console.log(`Photo by ${photo.photographer} on ${provider.credit}: ${photo.pageUrl}\n`);
}

main().catch((err) => fail(String(err)));
