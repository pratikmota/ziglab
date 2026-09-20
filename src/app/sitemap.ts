import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { listPublishedPosts } from "@/lib/content/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes = [
    "",
    "/about",
    "/sponsors",
    "/blog",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteConfig.domain}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const posts = listPublishedPosts().map((post) => ({
    url: `${siteConfig.domain}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...posts];
}
