"use client";

import { useTheme } from "next-themes";
import { ZigEditor, type ZigEditorTheme } from "zigeditor";

import { EditorReset } from "@/components/playground/EditorReset";
import type { PlaygroundPane } from "@/components/playground/types";
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
  resetTitle,
  resetBody,
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
  const row = playVersion(channel) ?? zigPlayVersions[0];

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      <div className="flex justify-end">
        <EditorReset
          source={code}
          template={template}
          onChange={onChange}
          title={resetTitle}
          body={resetBody}
        />
      </div>
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
          showReset={false}
          newHref={newHref}
          reportHref={reportHref}
        />
      </div>
    </div>
  );
}
