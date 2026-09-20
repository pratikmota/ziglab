import Link from "next/link";

import { PageHeader, Prose, proseLinkClass } from "@/components/content/Prose";
import { Badge } from "@/components/ui/badge";
import {
  formatPostDate,
  listPublishedPosts,
} from "@/lib/content/blog";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.blog,
  description: en.blog.intro,
  path: "/blog",
});

export default function BlogIndexPage() {
  const posts = listPublishedPosts();

  return (
    <Prose>
      <PageHeader title={en.blog.title} description={en.blog.intro} />

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{en.blog.empty}</p>
      ) : (
        <ul className="space-y-6">
          {posts.map((post) => (
            <li key={post.slug}>
              <article>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`${proseLinkClass} focus-visible:outline-2 focus-visible:outline-offset-2`}
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 leading-7 text-pretty text-muted-foreground">
                  {post.excerpt}
                </p>
                {post.tags.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Badge variant="secondary">{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </Prose>
  );
}
