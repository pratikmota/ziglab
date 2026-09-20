import Link from "next/link";

import { chapters, type ChapterLevel } from "@content/curriculum";
import { Badge } from "@/components/ui/badge";
import { en } from "@/lib/i18n/en";

const levelLabel: Record<ChapterLevel, string> = {
  start: en.curriculum.start,
  core: en.curriculum.core,
  advanced: en.curriculum.advanced,
};

export function CurriculumPreview() {
  return (
    <section className="bg-bg-elevated">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {en.curriculum.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {en.curriculum.intro}
        </p>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <li key={chapter.id}>
              <Link
                href={`/learn#${chapter.id}`}
                className="flex h-full flex-col rounded-xl border border-line bg-background p-4 transition-colors duration-150 ease-out hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {String(chapter.order).padStart(2, "0")}
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-[6px] font-medium"
                  >
                    {levelLabel[chapter.level]}
                  </Badge>
                </div>
                <p className="mt-3 font-medium text-foreground">
                  {chapter.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {chapter.goal}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
