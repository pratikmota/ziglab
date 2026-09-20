"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";
import type { RunResult, RunStatus } from "@/lib/execution/types";
import { cn } from "@/lib/utils";

export const OUTPUT_DEFAULT_HEIGHT = 200;
export const OUTPUT_COLLAPSED_HEIGHT = 36;
export const OUTPUT_MIN_HEIGHT = 80;
export const OUTPUT_MAX_HEIGHT = 480;

export function OutputPanel({
  running,
  adapterStatus = "loading",
  result,
  height,
  collapsed,
  fill = false,
  onToggleCollapsed,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  onClear,
}: {
  running: boolean;
  adapterStatus?: RunStatus;
  result: RunResult | null;
  height: number;
  collapsed: boolean;
  fill?: boolean;
  onToggleCollapsed: () => void;
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onResizeEnd: () => void;
  onClear: () => void;
}) {
  const panelHeight = collapsed ? OUTPUT_COLLAPSED_HEIGHT : height;
  const fillExpanded = fill && !collapsed;
  const stdout = result?.stdout ?? "";
  const stderr = result?.stderr ?? "";
  const showPreview = Boolean(result?.preview);
  const showSuccess = Boolean(result?.ok);
  const showError = Boolean(result && !result.ok && !result.preview);

  return (
    <section
      className={cn(
        "flex flex-col border-t border-line bg-bg-elevated",
        fillExpanded
          ? "max-lg:min-h-0 max-lg:flex-1 lg:h-(--pg-output-h) lg:shrink-0"
          : "shrink-0"
      )}
      style={{
        ["--pg-output-h" as string]: `${panelHeight}px`,
        ...(!fillExpanded ? { height: panelHeight } : {}),
      }}
      aria-label={en.play.output}
    >
      {collapsed ? null : (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label={en.play.resizeOutput}
          className="flex h-2 cursor-ns-resize items-center justify-center"
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
        >
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-2 px-3 sm:px-4",
          collapsed ? "h-9" : "min-h-9 flex-wrap py-1.5"
        )}
      >
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {en.play.output}
        </p>
        {collapsed ? null : (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {running || adapterStatus === "loading" ? (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                {running ? en.play.compiling : en.play.loadingCompiler}
              </span>
            ) : null}
            {showSuccess ? (
              <Badge className="bg-success/15 text-success hover:bg-success/15">
                {en.play.success}
              </Badge>
            ) : null}
            {showError ? (
              <Badge variant="destructive">{en.play.error}</Badge>
            ) : null}
            {showPreview ? (
              <Badge className="h-auto max-w-full whitespace-normal bg-warning/15 text-warning hover:bg-warning/15">
                {en.play.previewChip}
              </Badge>
            ) : null}
            {result ? (
              <span className="text-xs text-muted-foreground">
                {en.play.elapsed.replace("{ms}", String(result.durationMs))}
              </span>
            ) : null}
          </div>
        )}
        {collapsed ? <div className="min-w-0 flex-1" /> : (
          <Button type="button" variant="ghost" size="xs" onClick={onClear}>
            {en.play.clear}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onToggleCollapsed}
          aria-label={
            collapsed ? en.play.expandOutput : en.play.collapseOutput
          }
        >
          <ChevronDown
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      {collapsed ? null : (
        <div className="min-h-0 flex-1 overflow-auto px-3 pb-3 sm:px-4">
          {running || adapterStatus === "loading" ? null : !result ? (
            <p className="text-sm text-muted-foreground">
              {adapterStatus === "unavailable"
                ? en.play.unavailableCompiler
                : en.play.emptyOutput}
            </p>
          ) : (
            <pre className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-foreground">
              {stdout}
              {stdout && stderr ? "\n" : ""}
              {stderr ? (
                <span className={result.preview || result.ok ? "" : "text-destructive"}>
                  {stderr}
                </span>
              ) : null}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
