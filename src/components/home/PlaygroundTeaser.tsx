import Link from "next/link";

import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

const helloWorld = `const std = @import("std");

pub fn main() void {
    std.debug.print("Hello, ZigLab\\n", .{});
}`;

export function PlaygroundTeaser() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {en.playground.title}
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            {en.playground.body}
          </p>
          <Button
            size="lg"
            className="mt-6"
            nativeButton={false}
            render={<Link href="/play" />}
          >
            {en.playground.try}
          </Button>
        </div>

        <div
          aria-hidden
          className="overflow-hidden rounded-xl border border-line bg-bg-elevated"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-2">
            <span className="rounded-md border border-line bg-bg-input px-2 py-1 font-mono text-xs text-muted-foreground">
              {en.playground.channel}
            </span>
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
              {en.playground.run}
            </span>
          </div>
          <pre className="overflow-x-auto bg-bg-input p-4 font-mono text-[13px] leading-relaxed text-foreground">
            {helloWorld}
          </pre>
          <div className="border-t border-line bg-bg-elevated px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              {en.playground.output}
            </p>
            <p className="mt-1 font-mono text-[13px]">Hello, ZigLab</p>
          </div>
        </div>
      </div>
    </section>
  );
}
