"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/playground/ConfirmDialog";
import { EditorToolbar } from "@/components/playground/EditorToolbar";
import {
  OUTPUT_COLLAPSED_HEIGHT,
  OUTPUT_DEFAULT_HEIGHT,
  OUTPUT_MAX_HEIGHT,
  OUTPUT_MIN_HEIGHT,
  OutputPanel,
} from "@/components/playground/OutputPanel";
import { siteConfig } from "@/config/site";
import { getLessonHref } from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";
import type { ExecutionAdapter, RunResult, ZigChannel } from "@/lib/execution/types";
import { lessonReportUrl, playgroundReportUrl } from "@/lib/report";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-bg-input" aria-hidden />,
});

export type PlaygroundReportContext = {
  kind: "playground" | "lesson";
  lessonId?: string;
};

function lessonReportPath(lessonId: string) {
  const [chapter, ...slugParts] = lessonId.split("/");
  const slug = slugParts.join("/");
  if (!chapter || !slug) {
    return `/learn/${lessonId}`;
  }
  return getLessonHref({ chapter, slug });
}

export function Playground({
  source,
  channel,
  onChange,
  onChannelChange,
  adapter,
  template,
  reportContext,
  showNew = false,
}: {
  source: string;
  channel: ZigChannel;
  onChange: (code: string) => void;
  onChannelChange: (channel: ZigChannel) => void;
  adapter: ExecutionAdapter;
  template: string;
  reportContext: PlaygroundReportContext;
  showNew?: boolean;
}) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(OUTPUT_DEFAULT_HEIGHT);
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const sourceRef = useRef(source);
  const runningRef = useRef(running);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  const reportHref =
    reportContext.kind === "lesson" && reportContext.lessonId
      ? lessonReportUrl(
          reportContext.lessonId,
          `${siteConfig.domain}${lessonReportPath(reportContext.lessonId)}`,
          channel
        )
      : playgroundReportUrl(`${siteConfig.domain}/play`, channel);

  const handleRun = useCallback(async () => {
    if (runningRef.current) {
      return;
    }

    runningRef.current = true;
    setRunning(true);
    setResult(null);
    setCollapsed(false);

    try {
      const next = await adapter.run({
        code: sourceRef.current,
        channel,
      });
      setResult(next);
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [adapter, channel]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (resetOpen) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleRun();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleRun, resetOpen]);

  function onResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startY: event.clientY,
      startHeight: collapsed ? OUTPUT_COLLAPSED_HEIGHT : outputHeight,
    };
    if (collapsed) {
      setCollapsed(false);
    }
  }

  function onResizeMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) {
      return;
    }
    const delta = dragRef.current.startY - event.clientY;
    const next = Math.min(
      OUTPUT_MAX_HEIGHT,
      Math.max(OUTPUT_MIN_HEIGHT, dragRef.current.startHeight + delta)
    );
    setOutputHeight(next);
  }

  function onResizeEnd() {
    dragRef.current = null;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(source);
      toast.success(en.play.copied);
    } catch {
      toast.error(en.play.copyFailed);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <EditorToolbar
        channel={channel}
        running={running}
        showNew={showNew}
        reportHref={reportHref}
        onChannelChange={onChannelChange}
        onRun={() => void handleRun()}
        onReset={() => setResetOpen(true)}
        onCopy={() => void handleCopy()}
      />
      <p className="sr-only">{en.play.escHint}</p>
      <div className="relative min-h-[160px] flex-1">
        <CodeEditor
          className="absolute inset-0"
          value={source}
          onChange={onChange}
          onRun={() => void handleRun()}
        />
      </div>
      <OutputPanel
        running={running}
        result={result}
        height={outputHeight}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((open) => !open)}
        onResizeStart={onResizeStart}
        onResizeMove={onResizeMove}
        onResizeEnd={onResizeEnd}
        onClear={() => setResult(null)}
      />
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={en.play.resetTitle}
        description={en.play.resetBody}
        confirmLabel={en.play.resetConfirm}
        onConfirm={() => onChange(template)}
      />
    </div>
  );
}
