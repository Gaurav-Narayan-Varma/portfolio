import { projects } from "@/constants/projectConstants";
import { SITE_URL } from "@/lib/site";
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
    { url: `${SITE_URL}/contact`, lastModified: now, priority: 0.5 },
  ];
}
