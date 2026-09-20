import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComingFromCallout } from "@/components/learn/ComingFromCallout";
import { LessonShell } from "@/components/learn/LessonShell";
import { Quiz } from "@/components/learn/Quiz";
import { VideoEmbed } from "@/components/learn/VideoEmbed";
import { chapters } from "@content/curriculum";
import {
  getAdjacentLessons,
  getLesson,
  getLessonHref,
  listLessons,
} from "@/lib/content/lessons";
import { compileMdx } from "@/lib/content/mdx";
import { routeMetadata } from "@/lib/seo";

type LessonPageProps = {
  params: Promise<{ chapter: string; slug: string }>;
};

export function generateStaticParams() {
  return listLessons().map((lesson) => ({
    chapter: lesson.chapter,
    slug: lesson.slug,
  }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { chapter, slug } = await params;
  const lesson = getLesson(chapter, slug);

  if (!lesson) {
    return {};
  }

  return routeMetadata({
    title: lesson.title,
    description: lesson.description,
    path: getLessonHref(lesson),
  });
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { chapter, slug } = await params;
  const lesson = getLesson(chapter, slug);

  if (!lesson) {
    notFound();
  }

  const Content = await compileMdx(lesson.content);
  const adjacent = getAdjacentLessons(lesson.id);
  const allLessons = listLessons();
  const chapterTitle =
    chapters.find((entry) => entry.id === lesson.chapter)?.title ?? lesson.chapter;
  const navChapters = chapters.map((entry) => ({
    id: entry.id,
    order: entry.order,
    title: entry.title,
    lessons: allLessons
      .filter((item) => item.chapter === entry.id)
      .map((item) => ({
        id: item.id,
        chapter: item.chapter,
        slug: item.slug,
        title: item.title,
        order: item.order,
      })),
  }));
  const previous = adjacent.previous
    ? {
        id: adjacent.previous.id,
        chapter: adjacent.previous.chapter,
        slug: adjacent.previous.slug,
        title: adjacent.previous.title,
      }
    : null;
  const next = adjacent.next
    ? {
        id: adjacent.next.id,
        chapter: adjacent.next.chapter,
        slug: adjacent.next.slug,
        title: adjacent.next.title,
      }
    : null;

  return (
    <LessonShell
      lesson={{
        id: lesson.id,
        chapter: lesson.chapter,
        slug: lesson.slug,
        title: lesson.title,
        type: lesson.type,
        docsUrl: lesson.docsUrl,
      }}
      chapterTitle={chapterTitle}
      previous={previous}
      next={next}
      chapters={navChapters}
    >
      <article>
        <ComingFromCallout comingFrom={lesson.comingFrom} />
        <Content />
        <VideoEmbed url={lesson.videoUrl} />
        {lesson.type === "quiz" ? (
          <Quiz lessonId={lesson.id} items={lesson.quiz} />
        ) : null}
      </article>
    </LessonShell>
  );
}
