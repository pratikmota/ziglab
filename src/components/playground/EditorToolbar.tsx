"use client";

import { AlignLeft, Copy, Flag, Loader2, Play, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";
import type { RunStatus, ZigChannel } from "@/lib/execution/types";
import { zigPlayVersions, zigVersionLabel } from "@/lib/zig-version";

function DisabledTooltip({
  label,
  hint,
  icon,
}: {
  label: string;
  hint: string;
  icon?: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button type="button" variant="outline" size="sm" disabled>
          {icon}
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  );
}

export function EditorToolbar({
  channel,
  running,
  formatting = false,
  adapterStatus = "loading",
  compact = false,
  showFormat = false,
  canFormat = false,
  newHref,
  reportHref,
  onChannelChange,
  onRun,
  onFormat,
  onReset,
  onCopy,
}: {
  channel: ZigChannel;
  running: boolean;
  formatting?: boolean;
  adapterStatus?: RunStatus;
  compact?: boolean;
  showFormat?: boolean;
  canFormat?: boolean;
  newHref?: string;
  reportHref?: string;
  onChannelChange: (channel: ZigChannel) => void;
  onRun: () => void;
  onFormat?: () => void;
  onReset: () => void;
  onCopy: () => void;
}) {
  const versionItems = Object.fromEntries(
    zigPlayVersions.map((item) => [item.id, zigVersionLabel(item.id)])
  );
  const versionControl =
    zigPlayVersions.length < 2 ? (
      <span
        aria-label={en.play.channel}
        className="inline-flex h-7 items-center rounded-[min(var(--radius-md),10px)] border border-input px-2.5 font-mono text-sm dark:bg-input/30"
      >
        {zigVersionLabel(channel)}
      </span>
    ) : (
      <Select
        value={channel}
        onValueChange={(value) => {
          const next = zigPlayVersions.find((item) => item.id === value);
          if (next) {
            onChannelChange(next.id);
          }
        }}
        items={versionItems}
      >
        <SelectTrigger
          aria-label={en.play.channel}
          size="sm"
          className="min-w-36 font-mono"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          {zigPlayVersions.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {zigVersionLabel(item.id)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

  return (
    <div className="border-b border-line bg-bg-elevated px-3 py-2 sm:px-4">
      <div className="flex flex-wrap items-center gap-2">
        {versionControl}

        <Button
          type="button"
          size="sm"
          onClick={onRun}
          disabled={running || formatting || adapterStatus === "loading"}
          aria-busy={running || adapterStatus === "loading"}
        >
          {running || adapterStatus === "loading" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Play />
          )}
          {adapterStatus === "loading" ? en.play.loadingCompiler : en.play.run}
        </Button>

        {compact ? (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={en.play.reset}
                    onClick={onReset}
                  />
                }
              >
                <RotateCcw />
              </TooltipTrigger>
              <TooltipContent>{en.play.reset}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label={en.play.copy}
                    onClick={onCopy}
                  />
                }
              >
                <Copy />
              </TooltipTrigger>
              <TooltipContent>{en.play.copy}</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" onClick={onReset}>
              <RotateCcw />
              {en.play.reset}
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={onCopy}>
              <Copy />
              {en.play.copy}
            </Button>
          </>
        )}

        {compact ? null : showFormat ? (
          adapterStatus === "loading" || canFormat ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFormat}
              disabled={
                running ||
                formatting ||
                adapterStatus === "loading" ||
                adapterStatus === "unavailable"
              }
              aria-busy={formatting}
            >
              {formatting ? <Loader2 className="animate-spin" /> : <AlignLeft />}
              {en.play.format}
            </Button>
          ) : (
            <DisabledTooltip
              label={en.play.format}
              hint={en.play.formatSoon}
              icon={<AlignLeft />}
            />
          )
        ) : null}

        {compact ? null : newHref ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={newHref} />}
          >
            <Plus />
            {en.play.new}
          </Button>
        ) : null}

        {compact ? null : reportHref ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<a href={reportHref} {...externalLinkProps} />}
          >
            <Flag />
            {en.play.report}
          </Button>
        ) : null}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {adapterStatus === "loading"
          ? en.play.loadingCompiler
          : adapterStatus === "unavailable"
            ? en.play.channelHint
            : en.play.secretsWarning}
      </p>
    </div>
  );
}
