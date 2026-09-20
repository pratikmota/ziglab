"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

export function LessonHints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0);

  if (hints.length === 0) {
    return null;
  }

  const nextHint = Math.min(shown + 1, hints.length);
  const done = shown >= hints.length;

  return (
    <div className="mt-8 space-y-3">
      <Button
        type="button"
        variant="secondary"
        disabled={done}
        onClick={() => setShown((count) => Math.min(count + 1, hints.length))}
      >
        {en.learn.showHint} ({nextHint}/{hints.length})
      </Button>
      {shown > 0 ? (
        <ol className="space-y-2" aria-live="polite">
          {hints.slice(0, shown).map((hint, index) => (
            <li
              key={`${index}-${hint}`}
              className="rounded-xl border border-line bg-bg-elevated p-3 text-sm leading-6"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {index + 1}.
              </span>{" "}
              {hint}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
