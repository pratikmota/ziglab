"use client";

import { ChevronLeft, ChevronRight, Flag, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { LessonNav, type SidebarChapter } from "@/components/learn/LessonSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { siteConfig, externalLinkProps } from "@/config/site";
import {
  getLessonHref,
  type LessonMeta,
  type LessonType,
} from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";
import { markLessonComplete, markLessonOpened } from "@/lib/progress";
import { lessonReportUrl } from "@/lib/report";

export type LessonChrome = Pick<
  LessonMeta,
  "id" | "chapter" | "slug" | "title" | "type" | "docsUrl"
>;

export type AdjacentLesson = Pick<
  LessonMeta,
  "id" | "chapter" | "slug" | "title"
> | null;

const typeLabel: Record<LessonType, string> = {
  concept: en.learn.type.concept,
  try: en.learn.type.try,
  challenge: en.learn.type.challenge,
  quiz: en.learn.type.quiz,
};

export function LessonShell({
  lesson,
  chapterTitle,
  previous,
  next,
  chapters,
  children,
}: {
  lesson: LessonChrome;
  chapterTitle: string;
  previous: AdjacentLesson;
  next: AdjacentLesson;
  chapters: SidebarChapter[];
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const reportHref = lessonReportUrl(
    lesson.id,
    `${siteConfig.domain}${getLessonHref(lesson)}`
  );

  useEffect(() => {
    markLessonOpened(lesson.id);
  }, [lesson.id]);

  function completeIfConcept() {
    if (lesson.type === "concept") {
      markLessonComplete(lesson.id);
    }
  }

  const nextHref = next ? getLessonHref(next) : "/learn";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1">
      {!collapsed ? (
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 flex-col border-r border-line bg-background pl-4 sm:pl-6 xl:flex">
          <div className="flex items-center justify-between gap-2 px-3 py-3">
            <p className="text-sm font-medium">{en.learn.lessons}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={en.learn.collapseSidebar}
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftClose />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
            <LessonNav chapters={chapters} currentId={lesson.id} />
          </div>
        </aside>
      ) : (
        <div className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-12 shrink-0 flex-col items-center border-r border-line pt-3 xl:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={en.learn.expandSidebar}
            onClick={() => setCollapsed(false)}
          >
            <PanelLeft />
          </Button>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[72ch] px-4 py-8 sm:px-6 sm:py-10">
          <div className="mb-4 flex items-center gap-2 xl:hidden">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger
                render={
                  <Button type="button" variant="outline" size="sm" />
                }
              >
                {en.learn.lessons}
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>{en.learn.lessons}</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto px-2 pb-6">
                  <LessonNav
                    chapters={chapters}
                    currentId={lesson.id}
                    onNavigate={() => setDrawerOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <header className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">
                <Link
                  href="/learn"
                  className="hover:text-foreground hover:underline"
                >
                  {en.learn.title}
                </Link>
                <span aria-hidden> / </span>
                <span>{chapterTitle}</span>
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {lesson.title}
              </h1>
              <div className="mt-3">
                <Badge variant="secondary">{typeLabel[lesson.type]}</Badge>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    nativeButton={false}
                    render={
                      <a
                        href={reportHref}
                        {...externalLinkProps}
                        aria-label={en.learn.report}
                      />
                    }
                  />
                }
              >
                <Flag />
              </TooltipTrigger>
              <TooltipContent>{en.learn.report}</TooltipContent>
            </Tooltip>
          </header>

          {lesson.docsUrl ? (
            <p className="mt-4">
              <a
                href={lesson.docsUrl}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                {...externalLinkProps}
              >
                {en.learn.officialDocs}
              </a>
            </p>
          ) : null}

          <div className="mt-8">{children}</div>

          <Separator className="mt-10" />

          <nav
            aria-label={en.learn.pager}
            className="mt-6 flex flex-wrap items-center justify-between gap-3"
          >
            {previous ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href={getLessonHref(previous)} />}
              >
                <ChevronLeft />
                {en.learn.prev}
              </Button>
            ) : (
              <span />
            )}
            <Button
              nativeButton={false}
              render={<Link href={nextHref} />}
              onClick={completeIfConcept}
            >
              {next ? en.learn.next : en.learn.backToLearn}
              <ChevronRight />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
}
