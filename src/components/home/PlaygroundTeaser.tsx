import { Play } from "lucide-react";
import Link from "next/link";

import { EditorPreview } from "@/components/home/EditorPreview";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

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
            <Play data-icon="inline-start" aria-hidden />
            {en.playground.try}
          </Button>
        </div>

        <EditorPreview />
      </div>
    </section>
  );
}
