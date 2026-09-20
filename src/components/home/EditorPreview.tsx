import { Copy, Play, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { en } from "@/lib/i18n/en";
import { zigVersionLabel } from "@/lib/zig-version";

const kw = "text-hero-accent";
const str = "text-[#3ddc97]";
const op = "text-hero-muted";
const id = "text-hero-foreground";

const lines = [1, 2, 3, 4, 5];

export function EditorPreview({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-hero-foreground/15 bg-hero-elevated",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-hero-foreground/10 px-3 py-2">
        <span className="inline-flex h-7 shrink-0 items-center rounded-md border border-hero-foreground/15 px-2.5 font-mono text-xs text-hero-muted">
          {zigVersionLabel()}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-hero-accent px-2.5 text-xs font-medium text-hero-accent-fg">
            <Play className="size-3.5" />
            {en.play.run}
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-md border border-hero-foreground/15 text-hero-muted">
            <RotateCcw className="size-3.5" />
          </span>
          <span className="inline-flex size-7 items-center justify-center rounded-md border border-hero-foreground/15 text-hero-muted">
            <Copy className="size-3.5" />
          </span>
        </div>
      </div>
      <div className="flex bg-[#161410] font-mono text-[13px] leading-[1.65]">
        <div className="shrink-0 select-none border-r border-hero-foreground/10 px-2 py-3 text-right text-hero-muted">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <pre className="min-w-0 flex-1 overflow-x-auto py-3 pr-4 pl-3 whitespace-pre">
          <code>
            <span className={kw}>const</span> <span className={id}>std</span>{" "}
            <span className={op}>=</span> <span className={kw}>@import</span>
            <span className={op}>(</span>
            <span className={str}>&quot;std&quot;</span>
            <span className={op}>);</span>
            {"\n\n"}
            <span className={kw}>pub</span> <span className={kw}>fn</span>{" "}
            <span className={id}>main</span>
            <span className={op}>()</span> <span className={kw}>void</span>{" "}
            <span className={op}>{"{"}</span>
            {"\n"}
            {"    "}
            <span className={id}>std</span>
            <span className={op}>.</span>
            <span className={id}>debug</span>
            <span className={op}>.</span>
            <span className={id}>print</span>
            <span className={op}>(</span>
            <span className={str}>{'"Hello, ZigLab\\n"'}</span>
            <span className={op}>,</span> <span className={op}>.{"{}"}</span>
            <span className={op}>);</span>
            {"\n"}
            <span className={op}>{"}"}</span>
          </code>
        </pre>
      </div>
      <div className="border-t border-hero-foreground/10 px-4 py-3">
        <p className="text-xs font-medium text-hero-muted">{en.play.output}</p>
        <p className="mt-1 font-mono text-[13px] text-hero-foreground">
          Hello, ZigLab
        </p>
      </div>
    </div>
  );
}
