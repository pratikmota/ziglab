import type { ReactNode } from "react";

import {
  hasAnySponsors,
  type SponsorsFile,
} from "@/lib/content/sponsors";
import { externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";

function SponsorLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      {...externalLinkProps}
      className="font-medium text-foreground underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function SponsorLogoWall({ sponsors }: { sponsors: SponsorsFile }) {
  if (!hasAnySponsors(sponsors)) {
    return null;
  }

  return (
    <div className="mt-10 space-y-10">
      {sponsors.partners.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {en.sponsors.partners}
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {sponsors.partners.map((sponsor) => (
              <li
                key={sponsor.name}
                className="rounded-xl border border-line bg-bg-elevated p-5"
              >
                <a href={sponsor.url} {...externalLinkProps} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className="h-10 w-auto max-w-full object-contain"
                  />
                </a>
                <p className="mt-3 font-medium">
                  <SponsorLink href={sponsor.url}>{sponsor.name}</SponsorLink>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sponsor.blurb}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sponsors.gold.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {en.sponsors.gold}
          </h2>
          <ul className="mt-4 flex flex-wrap items-center gap-6">
            {sponsors.gold.map((sponsor) => (
              <li key={sponsor.name}>
                <a href={sponsor.url} {...externalLinkProps}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sponsor.logo}
                    alt={`${sponsor.name} logo`}
                    className="h-8 w-auto max-w-[10rem] object-contain"
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sponsors.community.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            {en.sponsors.community}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {sponsors.community.map((sponsor) => (
              <li key={sponsor.name}>
                {sponsor.url ? (
                  <SponsorLink href={sponsor.url}>{sponsor.name}</SponsorLink>
                ) : (
                  sponsor.name
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
