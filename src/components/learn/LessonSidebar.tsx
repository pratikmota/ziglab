"use client";

import { Check } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { ChapterMeta } from "@content/curriculum";
import {
  getLessonHref,
  type LessonMeta,
} from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export type SidebarChapter = Pick<ChapterMeta, "id" | "order" | "title" | "stub"> & {
  lessons: Pick<LessonMeta, "id" | "chapter" | "slug" | "title" | "order">[];
};

export function LessonNav({
  chapters,
  currentId,
  onNavigate,
}: {
  chapters: SidebarChapter[];
  currentId: string;
  onNavigate?: () => void;
}) {
  const progress = useProgress();

  return (
    <nav aria-label={en.learn.lessons} className="space-y-6">
      {chapters.map((chapter) => (
        <div key={chapter.id}>
          <p className="flex items-center justify-between gap-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <span>
              {String(chapter.order).padStart(2, "0")} {chapter.title}
            </span>
            {chapter.lessons.length === 0 ? (
              <Badge variant="outline" className="rounded-[6px] font-medium normal-case">
                {en.learn.soon}
              </Badge>
            ) : null}
          </p>
          {chapter.lessons.length > 0 ? (
            <ul className="mt-2 space-y-0.5">
              {chapter.lessons.map((lesson) => {
                const current = lesson.id === currentId;
                const done = progress.completed.includes(lesson.id);

                return (
                  <li key={lesson.id}>
                    <Link
                      href={getLessonHref(lesson)}
                      onClick={onNavigate}
                      aria-current={current ? "page" : undefined}
                      aria-label={
                        done
                          ? `${lesson.title}, ${en.learn.completed}`
                          : undefined
                      }
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        current
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                          done
                            ? "border-success bg-success text-primary-foreground"
                            : "border-line"
                        )}
                        aria-hidden
                      >
                        {done ? <Check className="size-3" /> : null}
                      </span>
                      <span>{lesson.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ))}
    </nav>
  );
}
