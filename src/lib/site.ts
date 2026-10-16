import type { Metadata } from "next";
import { projects } from "@/constants/projectConstants";

/**
 * Canonical origin used for metadataBase, the sitemap, canonical URLs and
 * Open Graph images. Set NEXT_PUBLIC_SITE_URL to the production domain
 * (e.g. https://gauravvarma.com); on Vercel it falls back to the production
 * URL that Vercel provides automatically.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001")
).replace(/\/$/, "");

export const SITE_NAME = "Gaurav Varma";
export const SITE_TITLE = "Gaurav Varma | Full Stack Engineer";
export const SITE_DESCRIPTION =
  "Gaurav Varma is a full stack engineer in San Francisco who builds products from concept to launch. Explore his case studies, or ask GauravGPT about his work.";

/**
 * The Writing section (/writing and its articles) is built but hidden until
 * there are posts to show. Set to `true` to add it to the navbar and sitemap
 * and to make the pages reachable again.
 */
export const SHOW_WRITING = true;

export const LINKEDIN_URL = "https://www.linkedin.com/in/gaurav-varma";
export const CAL_URL = "https://cal.com/gaurav-varma-ltovfk/1-1-conversation";

/** Path of the generated social card. `slug` selects a project card. */
export function ogImagePath(slug?: string) {
  return slug ? `/og?slug=${encodeURIComponent(slug)}` : "/og";
}

/** Shared page metadata: title, description, canonical URL, OG + Twitter cards. */
export function pageMetadata({
  title,
  description,
  path,
  ogSlug,
  noIndex,
}: {
  title: string;
  description: string;
  path: string;
  ogSlug?: string;
  noIndex?: boolean;
}): Metadata {
  const image = {
    url: ogImagePath(ogSlug),
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Metadata for a project case study page, derived from `projectConstants`. */
export function projectMetadata(slug: string): Metadata {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return pageMetadata({
    title: `${project.name}: ${project.description}`,
    description: `Case study: ${project.description.replace(/\.$/, "")}. How Gaurav Varma designed and built ${project.name} using ${project.stack
      .slice(0, 4)
      .map((t) => t.name)
      .join(", ")} and more.`,
    path: `/projects/${slug}`,
    ogSlug: slug,
  });
}
