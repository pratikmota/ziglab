"use client";

import { ChevronLeft, ChevronRight, Flag, PanelLeft, PanelLeftClose } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

import { LessonHints } from "@/components/learn/LessonHints";
import { LessonPlayground } from "@/components/learn/LessonPlayground";
import { LessonNav, type SidebarChapter } from "@/components/learn/LessonSidebar";
import { LessonWorkspace } from "@/components/learn/LessonWorkspace";
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
import {
  isLessonComplete,
  markLessonComplete,
  markLessonOpened,
  useProgress,
} from "@/lib/progress";
import { lessonReportUrl } from "@/lib/report";
import { cn } from "@/lib/utils";

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
  starter,
  matchSources,
  hints,
  expectedOutput,
  children,
}: {
  lesson: LessonChrome;
  chapterTitle: string;
  previous: AdjacentLesson;
  next: AdjacentLesson;
  chapters: SidebarChapter[];
  starter?: string;
  matchSources?: string[];
  hints?: string[];
  expectedOutput?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const progress = useProgress();
  const reportHref = lessonReportUrl(
    lesson.id,
    `${siteConfig.domain}${getLessonHref(lesson)}`
  );
  const hasEditor = Boolean(starter);
  const completed = isLessonComplete(lesson.id, progress);

  useEffect(() => {
    markLessonOpened(lesson.id);
  }, [lesson.id]);

  function completeIfConcept() {
    if (lesson.type === "concept") {
      markLessonComplete(lesson.id);
    }
  }

  const nextHref = next ? getLessonHref(next) : "/learn";
  const lessonHints = hints ?? [];
  const output = expectedOutput ?? "";

  const header = (
    <>
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
    </>
  );

  const pager = (
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
  );

  const learnColumn = (
    <>
      {header}
      <div className="mt-8">{children}</div>
      {hasEditor ? (
        <>
          <LessonHints hints={lessonHints} />
          {output ? (
            <div className="mt-8">
              <p className="text-sm font-medium">{en.learn.expectedOutput}</p>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-line bg-bg-input p-3 font-mono text-sm">
                {output}
              </pre>
            </div>
          ) : null}
          {lesson.type === "try" || lesson.type === "challenge" ? (
            <div className="mt-8">
              <Button
                type="button"
                disabled={completed}
                onClick={() => markLessonComplete(lesson.id)}
              >
                {en.learn.markComplete}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
      <Separator className="mt-10" />
      {pager}
    </>
  );

  return (
    <div
      className={cn(
        "flex w-full flex-1",
        hasEditor ? "" : "mx-auto max-w-6xl"
      )}
    >
      {!collapsed ? (
        <aside className="sticky top-14 hidden max-h-[calc(100dvh-3.5rem)] w-[260px] shrink-0 flex-col self-start overflow-y-auto border-r border-line bg-background pl-4 sm:pl-6 xl:flex">
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
          <div className="px-2 pb-6">
            <LessonNav chapters={chapters} currentId={lesson.id} />
          </div>
        </aside>
      ) : (
        <div className="sticky top-14 hidden max-h-[calc(100dvh-3.5rem)] w-12 shrink-0 flex-col items-center self-start border-r border-line pt-3 xl:flex">
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
        <div
          className={cn(
            "mx-auto w-full px-4 py-8 sm:px-6 sm:py-10",
            hasEditor ? "max-w-none" : "max-w-[72ch]"
          )}
        >
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

          {hasEditor && starter ? (
            <LessonWorkspace
              learn={learnColumn}
              playground={(pane) => (
                <LessonPlayground
                  key={lesson.id}
                  lessonId={lesson.id}
                  starter={starter}
                  matchSources={matchSources ?? []}
                  expectedOutput={output}
                  pane={pane}
                />
              )}
            />
          ) : (
            learnColumn
          )}
        </div>
      </div>
    </div>
  );
}
