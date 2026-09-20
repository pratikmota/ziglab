"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { chapters, type ChapterLevel, type ChapterMeta } from "@content/curriculum";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { getLessonHref, type LessonMeta } from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";
import { clearLearnProgress, hasLearnLocalData, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export type LearnIndexLesson = Pick<
  LessonMeta,
  "id" | "chapter" | "slug" | "title"
>;

const levelLabel: Record<ChapterLevel, string> = {
  start: en.curriculum.start,
  core: en.curriculum.core,
  advanced: en.curriculum.advanced,
};

const cardClass =
  "flex h-full flex-col rounded-xl border border-line bg-background p-4 transition-colors duration-150 ease-out";

export function LearnIndex({
  lessons,
}: {
  lessons: LearnIndexLesson[];
}) {
  const progress = useProgress();
  const [clearOpen, setClearOpen] = useState(false);
  const total = lessons.length;
  const completedCount = lessons.filter((lesson) =>
    progress.completed.includes(lesson.id)
  ).length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const lastLesson = lessons.find((lesson) => lesson.id === progress.lastLesson);
  const hasProgress = hasLearnLocalData();

  const lessonsByChapter = new Map<string, LearnIndexLesson[]>();
  for (const lesson of lessons) {
    const list = lessonsByChapter.get(lesson.chapter) ?? [];
    list.push(lesson);
    lessonsByChapter.set(lesson.chapter, list);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Progress
          value={percent}
          className="max-w-md flex-1 [&_[data-slot=progress-track]]:h-2"
        >
          <ProgressLabel>{en.learn.progress}</ProgressLabel>
          <ProgressValue>{() => `${completedCount}/${total}`}</ProgressValue>
        </Progress>
        {hasProgress ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setClearOpen(true)}
          >
            {en.learn.clearProgress}
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-8 items-center">
        {lastLesson ? (
          <Button
            nativeButton={false}
            render={<Link href={getLessonHref(lastLesson)} />}
          >
            {en.learn.continue}: {lastLesson.title}
          </Button>
        ) : null}
      </div>

      <ConfirmDialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title={en.learn.clearProgressTitle}
        description={en.learn.clearProgressBody}
        confirmLabel={en.learn.clearProgressConfirm}
        confirmVariant="destructive"
        onConfirm={() => {
          clearLearnProgress();
          toast.success(en.learn.clearedProgress);
        }}
      />

      <ul className="grid gap-3 sm:grid-cols-2">
        {chapters.map((chapter) => (
          <li key={chapter.id} id={chapter.id} className="scroll-mt-24">
            <ChapterCard
              chapter={chapter}
              chapterLessons={lessonsByChapter.get(chapter.id) ?? []}
              completed={progress.completed}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChapterCard({
  chapter,
  chapterLessons,
  completed,
}: {
  chapter: ChapterMeta;
  chapterLessons: LearnIndexLesson[];
  completed: string[];
}) {
  const first = chapterLessons[0];
  const done = chapterLessons.filter((lesson) =>
    completed.includes(lesson.id)
  ).length;
  const soon = !first;

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          {String(chapter.order).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-2">
          {soon ? (
            <Badge variant="secondary" className="rounded-[6px] font-medium">
              {en.learn.soon}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-[6px] font-medium">
            {levelLabel[chapter.level]}
          </Badge>
        </div>
      </div>
      <p className="mt-3 font-medium text-foreground">{chapter.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{chapter.goal}</p>
      {soon ? null : (
        <p className="mt-3 text-sm text-muted-foreground">
          {chapterLessons.length} {en.learn.lessonCount} · {done}/
          {chapterLessons.length}
        </p>
      )}
    </>
  );

  if (!first) {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <Link
      href={getLessonHref(first)}
      className={cn(
        cardClass,
        "hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      )}
    >
      {inner}
    </Link>
  );
}
