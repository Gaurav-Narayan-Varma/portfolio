import { projects } from "@/constants/projectConstants";
import { SHOW_WRITING, SITE_URL } from "@/lib/site";
import { getInternalArticles } from "@/lib/writing";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified: now, priority: 0.8 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: now,
      priority: 0.7,
    })),
    ...(SHOW_WRITING
      ? [
          { url: `${SITE_URL}/writing`, lastModified: now, priority: 0.8 },
          ...getInternalArticles().map((a) => ({
            url: `${SITE_URL}/writing/${a.slug}`,
            lastModified: new Date(a.updated ?? a.date),
            priority: 0.6,
          })),
        ]
      : []),
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.5 },
  ];
}
