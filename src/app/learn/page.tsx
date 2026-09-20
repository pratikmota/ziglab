import { PageHeader, Prose } from "@/components/content/Prose";
import { LearnIndex } from "@/components/learn/LearnIndex";
import { listLessons } from "@/lib/content/lessons";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.learn,
  description: en.learn.intro,
  path: "/learn",
});

export default function LearnPage() {
  const lessons = listLessons().map((lesson) => ({
    id: lesson.id,
    chapter: lesson.chapter,
    slug: lesson.slug,
    title: lesson.title,
  }));

  return (
    <Prose className="max-w-4xl">
      <PageHeader title={en.learn.title} description={en.learn.intro} />
      <LearnIndex lessons={lessons} />
    </Prose>
  );
}
