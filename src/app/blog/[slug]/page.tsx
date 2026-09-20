import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader, Prose } from "@/components/content/Prose";
import { Badge } from "@/components/ui/badge";
import {
  formatPostDate,
  getPostBySlug,
  listPublishedPosts,
} from "@/lib/content/blog";
import { compileMdx } from "@/lib/content/mdx";
import { routeMetadata } from "@/lib/seo";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listPublishedPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.draft) {
    return {};
  }

  return routeMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || post.draft) {
    notFound();
  }

  const Content = await compileMdx(post.content);

  return (
    <Prose>
      <article>
        <p className="mb-3 text-sm text-muted-foreground">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
        </p>
        <PageHeader title={post.title} description={post.excerpt} />
        {post.tags.length > 0 ? (
          <ul className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="secondary">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
        <Content />
      </article>
    </Prose>
  );
}
