import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[65ch] px-4 py-12 sm:px-6 sm:py-16",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-lg text-muted-foreground text-pretty">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-pretty">{children}</div>
    </section>
  );
}

export const proseLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline focus-visible:underline";
