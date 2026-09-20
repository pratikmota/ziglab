import Link from "next/link";
import type { ReactNode } from "react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { ZigLabBrandLink } from "@/components/layout/ZigLabMark";
import { Separator } from "@/components/ui/separator";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";
import { footerNav, legalNav } from "@/lib/nav";

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      {...externalLinkProps}
      aria-label={label}
      className="text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </a>
  );
}

export function Footer({ compact = false }: { compact?: boolean }) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t border-line bg-bg-elevated">
        <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:px-6">
          <p className="truncate">{en.footer.tagline}</p>
          <p className="shrink-0">
            © {year} {en.footer.copyright}
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-line bg-bg-elevated">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3">
            <ZigLabBrandLink />
            <p className="text-sm text-muted-foreground">{en.footer.tagline}</p>
            <p className="text-sm">
              <a
                href={siteConfig.github}
                {...externalLinkProps}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {en.footer.openSource}
              </a>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {en.footer.navHeading}
              </p>
              <ul className="space-y-2 text-sm">
                {footerNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground/90 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {en.footer.legalHeading}
              </p>
              <ul className="space-y-2 text-sm">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-foreground/90 hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {en.footer.supportHeading}
              </p>
              <Link
                href="/sponsors"
                className="text-sm font-medium text-primary hover:text-[color:var(--accent-hover)]"
              >
                {en.sponsors.keepOnline}
              </Link>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              © {year} {en.footer.copyright}. {en.footer.trademark}
            </p>
            <p>
              {en.footer.disclaimerLead}{" "}
              <a
                href={siteConfig.zigOfficial}
                {...externalLinkProps}
                className="underline-offset-4 hover:underline"
              >
                ziglang.org
              </a>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SocialIcon href={siteConfig.github} label={en.nav.github}>
              <GitHubIcon className="size-4" />
            </SocialIcon>
            <SocialIcon href={siteConfig.social.ziggit} label={en.nav.ziggit}>
              <span className="text-xs font-semibold tracking-wide">Zg</span>
            </SocialIcon>
            <SocialIcon href={siteConfig.social.discord} label={en.nav.discord}>
              <span className="text-xs font-semibold">Dc</span>
            </SocialIcon>
            <SocialIcon href={siteConfig.social.x} label={en.nav.x}>
              <span className="text-xs font-semibold">X</span>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}
