import Link from "next/link";

import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

export function SponsorsStrip() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {en.sponsors.strip}
      </h2>
      <div className="mt-6 rounded-xl border border-dashed border-line bg-bg-elevated px-6 py-10 text-center">
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          {en.sponsors.empty}
        </p>
        <Button
          className="mt-5"
          nativeButton={false}
          render={<Link href="/sponsors" />}
        >
          {en.sponsors.cta}
        </Button>
      </div>
    </section>
  );
}
