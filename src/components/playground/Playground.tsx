"use client";

import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditorToolbar } from "@/components/playground/EditorToolbar";
import {
  OUTPUT_COLLAPSED_HEIGHT,
  OUTPUT_DEFAULT_HEIGHT,
  OUTPUT_MAX_HEIGHT,
  OUTPUT_MIN_HEIGHT,
  OutputPanel,
} from "@/components/playground/OutputPanel";
import type { PlaygroundChrome, PlaygroundPane } from "@/components/playground/types";
import type { ExecutionAdapter, RunResult, RunStatus, ZigChannel } from "@/lib/execution/types";
import { en } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), {
  ssr: false,
  loading: () => <div className="h-full bg-bg-input" aria-hidden />,
});

function subscribeNever() {
  return () => {};
}

/** False on the server and the hydration render so adapter chrome cannot mismatch. */
function useClientPaint() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export type { PlaygroundChrome, PlaygroundPane };

export function Playground({
  source,
  channel,
  onChange,
  onChannelChange,
  adapter,
  template,
  chrome = {},
  pane = "all",
  matchSources,
  expectedOutput,
  resetTitle = en.play.resetTitle,
  resetBody = en.play.resetBody,
  className,
}: {
  source: string;
  channel: ZigChannel;
  onChange: (code: string) => void;
  onChannelChange: (channel: ZigChannel) => void;
  adapter: ExecutionAdapter;
  template: string;
  chrome?: PlaygroundChrome;
  pane?: PlaygroundPane;
  matchSources?: string[];
  expectedOutput?: string;
  resetTitle?: string;
  resetBody?: string;
  className?: string;
}) {
  const [running, setRunning] = useState(false);
  const [statusForAdapter, setStatusForAdapter] = useState<{
    id: string;
    status: RunStatus;
  }>({ id: adapter.id, status: "loading" });
  const [result, setResult] = useState<RunResult | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [outputHeight, setOutputHeight] = useState(OUTPUT_DEFAULT_HEIGHT);
  const [collapsed, setCollapsed] = useState(false);
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const sourceRef = useRef(source);
  const runningRef = useRef(running);
  const clientPaint = useClientPaint();

  const adapterStatus: RunStatus = clientPaint
    ? statusForAdapter.id === adapter.id
      ? statusForAdapter.status
      : "loading"
    : "loading";

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(adapter.status()).then((next) => {
      if (!cancelled) setStatusForAdapter({ id: adapter.id, status: next });
    });
    return () => {
      cancelled = true;
    };
  }, [adapter]);

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
        matchSources,
        expectedOutput,
      });
      setResult(next);
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [adapter, channel, expectedOutput, matchSources]);

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
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className={cn(pane === "output" && "max-lg:hidden")}>
        <EditorToolbar
          channel={channel}
          running={running}
          adapterStatus={adapterStatus}
          compact={chrome.compact}
          showFormat={chrome.showFormat}
          newHref={chrome.newHref}
          reportHref={chrome.reportHref}
          onChannelChange={onChannelChange}
          onRun={() => void handleRun()}
          onReset={() => setResetOpen(true)}
          onCopy={() => void handleCopy()}
        />
      </div>
      <p className="sr-only">{en.play.escHint}</p>
      <div
        className={cn(
          "relative min-h-[160px] flex-1",
          pane === "output" && "max-lg:hidden"
        )}
      >
        <CodeEditor
          className="absolute inset-0"
          value={source}
          onChange={onChange}
          onRun={() => void handleRun()}
        />
      </div>
      <div
        className={cn(
          "flex min-h-0 flex-col",
          pane === "editor" && "max-lg:hidden",
          pane === "output" && "max-lg:min-h-0 max-lg:flex-1"
        )}
      >
        <OutputPanel
          running={running}
          adapterStatus={adapterStatus}
          result={result}
          height={outputHeight}
          collapsed={collapsed}
          fill={pane === "output"}
          onToggleCollapsed={() => setCollapsed((open) => !open)}
          onResizeStart={onResizeStart}
          onResizeMove={onResizeMove}
          onResizeEnd={onResizeEnd}
          onClear={() => setResult(null)}
        />
      </div>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={resetTitle}
        description={resetBody}
        confirmLabel={en.play.resetConfirm}
        onConfirm={() => {
          const alreadyTemplate = source === template;
          onChange(template);
          if (!alreadyTemplate) {
            toast.success(en.play.resetDone);
          }
        }}
      />
    </div>
  );
}
