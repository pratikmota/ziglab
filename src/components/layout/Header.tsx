"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { GitHubIcon } from "@/components/icons/GitHubIcon";
import {
  ZigLabBrandLink,
  ZigLabMark,
  ZigLabWordmark,
} from "@/components/layout/ZigLabMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";
import { mainNav } from "@/lib/nav";
import { chromeLinkClass, cn } from "@/lib/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex items-center gap-6", className)} aria-label="Main">
      {mainNav.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              chromeLinkClass,
              "text-sm font-medium transition-colors duration-150 ease-out",
              active
                ? "text-foreground underline decoration-primary decoration-2 underline-offset-8"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <ZigLabBrandLink />

        <NavLinks pathname={pathname} className="hidden md:flex" />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <a
                href={siteConfig.github}
                {...externalLinkProps}
                aria-label={en.nav.github}
              />
            }
          >
            <GitHubIcon />
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label={en.nav.menu}
                />
              }
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ZigLabMark className="size-7" />
                  <ZigLabWordmark />
                  <span className="sr-only">{siteConfig.name}</span>
                </SheetTitle>
              </SheetHeader>
              <NavLinks
                pathname={pathname}
                onNavigate={() => setOpen(false)}
                className="flex-col items-start gap-4 px-4"
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
