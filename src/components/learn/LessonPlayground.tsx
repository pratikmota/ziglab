"use client";

import { ZigPlayEditor } from "@/components/playground/ZigPlayEditor";
import type { PlaygroundPane } from "@/components/playground/types";
import { useEditorSession } from "@/components/playground/use-editor-session";
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
  const { code, channel, setCode } = useEditorSession({
    sessionKey: lessonId,
    stored: draft,
    fallbackCode: starter,
    persist: (next) => writeLessonDraft(lessonId, next),
  });

  return (
    <ZigPlayEditor
      code={code}
      channel={channel}
      onChange={setCode}
      template={starter}
      pane={pane}
      compact
      showFormat={false}
      matchSources={matchSources}
      expectedOutput={expectedOutput || undefined}
      resetTitle={en.learn.resetTitle}
      resetBody={en.learn.resetBody}
      className={className}
    />
  );
}
