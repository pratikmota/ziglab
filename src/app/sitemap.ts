import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { listPublishedPosts } from "@/lib/content/blog";
import { getLessonHref, listLessons } from "@/lib/content/lessons";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes = [
    "",
    "/learn",
    "/play",
    "/about",
    "/support",
    "/blog",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${siteConfig.domain}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority:
      path === "" ? 1 : path === "/learn" || path === "/play" ? 0.9 : 0.7,
  }));

  const lessons = listLessons().map((lesson) => ({
    url: `${siteConfig.domain}${getLessonHref(lesson)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const posts = listPublishedPosts().map((post) => ({
    url: `${siteConfig.domain}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00.000Z`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...lessons, ...posts];
}
