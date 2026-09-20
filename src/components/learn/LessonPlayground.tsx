"use client";

import { Playground } from "@/components/playground/Playground";
import type { PlaygroundPane } from "@/components/playground/types";
import { useEditorSession } from "@/components/playground/use-editor-session";
import { usePlayAdapter } from "@/components/playground/use-play-adapter";
import { en } from "@/lib/i18n/en";
import { useLessonDraft, writeLessonDraft } from "@/lib/lesson-draft";

export function LessonPlayground({
  lessonId,
  starter,
  matchSources,
  expectedOutput,
  pane = "all",
  className,
}: {
  lessonId: string;
  starter: string;
  matchSources: string[];
  expectedOutput: string;
  pane?: PlaygroundPane;
  className?: string;
}) {
  const draft = useLessonDraft(lessonId);
  const { code, channel, setCode, setChannel } = useEditorSession({
    sessionKey: lessonId,
    stored: draft,
    fallbackCode: starter,
    persist: (next) => writeLessonDraft(lessonId, next),
  });
  const adapter = usePlayAdapter(channel);

  return (
    <Playground
      source={code}
      channel={channel}
      onChange={setCode}
      onChannelChange={setChannel}
      adapter={adapter}
      template={starter}
      chrome={{ compact: true }}
      pane={pane}
      matchSources={matchSources}
      expectedOutput={expectedOutput || undefined}
      resetTitle={en.learn.resetTitle}
      resetBody={en.learn.resetBody}
      className={className}
    />
  );
}
