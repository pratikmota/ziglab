"use client";

import { useState, type ReactNode } from "react";

import type { PlaygroundPane } from "@/components/playground/types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { en } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

type LessonTab = "learn" | "code" | "output";

function paneForTab(tab: LessonTab): PlaygroundPane {
  if (tab === "output") {
    return "output";
  }
  if (tab === "code") {
    return "editor";
  }
  return "all";
}

export function LessonWorkspace({
  learn,
  playground,
}: {
  learn: ReactNode;
  playground: (pane: PlaygroundPane) => ReactNode;
}) {
  const [tab, setTab] = useState<LessonTab>("learn");
  const pane = paneForTab(tab);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(20rem,1fr)_minmax(360px,1.15fr)] lg:items-start lg:gap-8">
      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (value === "learn" || value === "code" || value === "output") {
            setTab(value);
          }
        }}
        className="flex min-h-0 flex-1 flex-col gap-4 lg:contents"
      >
        <TabsList className="grid w-full grid-cols-3 lg:hidden">
          <TabsTrigger value="learn">{en.learn.tabLearn}</TabsTrigger>
          <TabsTrigger value="code">{en.learn.tabCode}</TabsTrigger>
          <TabsTrigger value="output">{en.learn.tabOutput}</TabsTrigger>
        </TabsList>
        <div
          className={cn(
            "min-w-0 max-w-[72ch]",
            tab !== "learn" && "max-lg:hidden"
          )}
        >
          {learn}
        </div>
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-line lg:sticky lg:top-20 lg:min-w-[360px] lg:max-h-[calc(100dvh-6rem)]",
            tab === "learn" && "max-lg:hidden"
          )}
        >
          <div className="flex min-h-[min(70dvh,36rem)] flex-1 flex-col lg:min-h-[32rem]">
            {playground(pane)}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
