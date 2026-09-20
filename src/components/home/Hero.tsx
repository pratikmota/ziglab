import { BookOpen, Play } from "lucide-react";
import Link from "next/link";

import { EditorPreview } from "@/components/home/EditorPreview";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { en } from "@/lib/i18n/en";

export function Hero() {
  return (
    <section className="relative isolate bg-hero text-hero-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--hero-glow),transparent_55%)]"
      />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-12 lg:py-32">
        <div>
          <p className="text-sm font-medium tracking-wide text-hero-accent uppercase">
            {siteConfig.name}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            <span className="block">{en.hero.headline}</span>
            <span className="block">{en.hero.headlineNext}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-hero-muted sm:text-xl">
            {en.hero.sub}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-hero-accent text-hero-accent-fg hover:bg-hero-accent-hover"
              nativeButton={false}
              render={<Link href="/learn" />}
            >
              <BookOpen data-icon="inline-start" aria-hidden />
              {en.hero.start}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-hero-foreground/40 bg-transparent text-hero-foreground hover:border-hero-foreground/70 hover:bg-hero-elevated hover:text-hero-foreground dark:border-hero-foreground/40 dark:bg-transparent dark:hover:border-hero-foreground/70 dark:hover:bg-hero-elevated dark:hover:text-hero-foreground"
              nativeButton={false}
              render={<Link href="/play" />}
            >
              <Play data-icon="inline-start" aria-hidden />
              {en.hero.play}
            </Button>
          </div>
        </div>

        <EditorPreview className="hidden lg:block" />
      </div>
    </section>
  );
}
