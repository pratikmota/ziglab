import Link from "next/link";

import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

export const metadata = {
  title: en.meta.notFound,
  description: en.notFound.body,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[65ch] flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {en.notFound.title}
      </h1>
      <p className="mt-3 text-lg text-muted-foreground text-pretty">
        {en.notFound.body}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" nativeButton={false} render={<Link href="/" />}>
          {en.notFound.home}
        </Button>
        <Button
          size="lg"
          variant="outline"
          nativeButton={false}
          render={<Link href="/learn" />}
        >
          {en.notFound.learn}
        </Button>
      </div>
    </div>
  );
}
