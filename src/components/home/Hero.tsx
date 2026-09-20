import Link from "next/link";

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
      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6">
        <p className="text-sm font-medium tracking-wide text-hero-accent uppercase">
          {siteConfig.name}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          {en.hero.headline}
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
            {en.hero.start}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-hero-foreground/40 bg-transparent text-hero-foreground hover:bg-hero-elevated hover:text-hero-foreground dark:border-hero-foreground/40 dark:bg-transparent dark:hover:bg-hero-elevated dark:hover:text-hero-foreground"
            nativeButton={false}
            render={<Link href="/play" />}
          >
            {en.hero.play}
          </Button>
        </div>
      </div>
    </section>
  );
}
