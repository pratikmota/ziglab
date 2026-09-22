"use client";

import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { ZigEditor, type ZigEditorTheme } from "zigeditor";

import type { PlaygroundPane } from "@/components/playground/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { en } from "@/lib/i18n/en";
import { cn } from "@/lib/utils";
import {
  playVersion,
  zigPlayVersions,
  zigVersionLabel,
  type ZigChannel,
} from "@/lib/zig-version";

function siteTheme(theme: string | undefined, resolvedTheme: string | undefined): ZigEditorTheme {
  if (resolvedTheme === "light" || resolvedTheme === "dark") return resolvedTheme;
  if (theme === "light" || theme === "dark" || theme === "system") return theme;
  return "system";
}

export function ZigPlayEditor({
  code,
  channel,
  onChange,
  template,
  pane = "all",
  compact = false,
  showFormat = true,
  newHref,
  reportHref,
  matchSources,
  expectedOutput,
  resetTitle = en.play.resetTitle,
  resetBody = en.play.resetBody,
  className,
}: {
  code: string;
  channel: ZigChannel;
  onChange: (code: string) => void;
  template: string;
  pane?: PlaygroundPane;
  compact?: boolean;
  showFormat?: boolean;
  newHref?: string;
  reportHref?: string;
  matchSources?: string[];
  expectedOutput?: string;
  resetTitle?: string;
  resetBody?: string;
  className?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  const [resetOpen, setResetOpen] = useState(false);
  const row = playVersion(channel) ?? zigPlayVersions[0];

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="min-h-0 flex-1">
        <ZigEditor
          key={channel}
          className="h-full"
          value={code}
          onChange={onChange}
          initialValue={template}
          theme={siteTheme(theme, resolvedTheme)}
          versionLabel={zigVersionLabel(channel)}
          compilerLabel={`Zig ${row.zigVersion}`}
          artifacts={{
            moduleUrl: row.moduleUrl,
            stdUrl: row.stdUrl,
            compilerRtUrl: row.compilerRtUrl,
          }}
          compileTimeoutMs={row.compileTimeoutMs}
          runTimeoutMs={row.runTimeoutMs}
          expectedOutput={expectedOutput}
          matchSources={matchSources}
          pane={pane}
          compact={compact}
          showFormat={showFormat}
          onReset={() => setResetOpen(true)}
          newHref={newHref}
          reportHref={reportHref}
        />
      </div>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={resetTitle}
        description={resetBody}
        confirmLabel={en.play.resetConfirm}
        onConfirm={() => {
          const alreadyTemplate = code === template;
          onChange(template);
          if (!alreadyTemplate) {
            toast.success(en.play.resetDone);
          }
        }}
      />
    </div>
  );
}
