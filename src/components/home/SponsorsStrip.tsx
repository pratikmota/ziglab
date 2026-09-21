import Link from "next/link";

import { SponsorLogoWall } from "@/components/sponsors/SponsorLogoWall";
import { Button } from "@/components/ui/button";
import { getSponsors, hasAnySponsors } from "@/lib/content/sponsors";
import { en } from "@/lib/i18n/en";

export function SponsorsStrip() {
  const sponsors = getSponsors();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {en.sponsors.strip}
      </h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{en.sponsors.pageLead}</p>
      <Button
        className="mt-6"
        nativeButton={false}
        render={<Link href="/sponsors" />}
      >
        {en.sponsors.cta}
      </Button>
      {hasAnySponsors(sponsors) ? <SponsorLogoWall sponsors={sponsors} /> : null}
    </section>
  );
}
