import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export const blogTags = ["Release", "Tip", "Community"] as const;
export type BlogTag = (typeof blogTags)[number];

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: BlogTag[];
  draft: boolean;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  throw new Error("Blog post is missing a valid date (YYYY-MM-DD).");
}

function parseTags(value: unknown, slug: string): BlogTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    if (typeof entry !== "string") {
      throw new Error(`Blog post "${slug}" has a tag that is not a string.`);
    }

    const match = blogTags.find(
      (tag) => tag.toLowerCase() === entry.toLowerCase()
    );

    if (!match) {
      throw new Error(
        `Blog post "${slug}" has unknown tag "${entry}". Use Release, Tip, or Community.`
      );
    }

    return match;
  });
}

function parsePost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);

  if (typeof data.title !== "string" || typeof data.excerpt !== "string") {
    throw new Error(`Blog post "${slug}" is missing title or excerpt.`);
  }

  return {
    slug,
    title: data.title,
    date: toIsoDate(data.date),
    excerpt: data.excerpt,
    tags: parseTags(data.tags, slug),
    draft: Boolean(data.draft),
    content,
  };
}

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }

  const blogDir = path.resolve(BLOG_DIR);
  const filePath = path.resolve(blogDir, `${slug}.mdx`);
  const relative = path.relative(blogDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parsePost(slug, fs.readFileSync(filePath, "utf8"));
}

export function listPublishedPosts(): BlogPostMeta[] {
  return getBlogSlugs()
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null && !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(({ slug, title, date, excerpt, tags, draft }) => ({
      slug,
      title,
      date,
      excerpt,
      tags,
      draft,
    }));
}

export function formatPostDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(Date.UTC(year, month - 1, day))
  );
}
