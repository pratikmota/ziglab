"use client";

import { Copy, Flag, Loader2, Play, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";

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
import type { ZigChannel } from "@/lib/execution/types";
import { zigPlayVersions, zigVersionLabel } from "@/lib/zig-version";

function DisabledTooltip({
  label,
  hint,
}: {
  label: string;
  hint: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <Button type="button" variant="outline" size="sm" disabled>
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
  showNew,
  reportHref,
  onChannelChange,
  onRun,
  onReset,
  onCopy,
}: {
  channel: ZigChannel;
  running: boolean;
  showNew: boolean;
  reportHref: string;
  onChannelChange: (channel: ZigChannel) => void;
  onRun: () => void;
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
          disabled={running}
          aria-busy={running}
        >
          {running ? <Loader2 className="animate-spin" /> : <Play />}
          {en.play.run}
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onReset}>
          <RotateCcw />
          {en.play.reset}
        </Button>

        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy />
          {en.play.copy}
        </Button>

        <DisabledTooltip label={en.play.format} hint={en.play.formatSoon} />

        {showNew ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/play/new" />}
          >
            <Plus />
            {en.play.new}
          </Button>
        ) : null}

        <DisabledTooltip label={en.play.share} hint={en.play.shareSoon} />

        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<a href={reportHref} {...externalLinkProps} />}
        >
          <Flag />
          {en.play.report}
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {en.play.channelHint}
      </p>
    </div>
  );
}
