import { en } from "@/lib/i18n/en";

export const mainNav = [
  { href: "/learn", label: en.nav.learn },
  { href: "/play", label: en.nav.play },
  { href: "/sponsors", label: en.nav.sponsors },
  // Blog: { href: "/blog", label: en.nav.blog },
] as const;

export const footerNav = [
  { href: "/learn", label: en.nav.learn },
  { href: "/play", label: en.nav.play },
  { href: "/about", label: en.nav.about },
  // Blog: { href: "/blog", label: en.nav.blog },
] as const;

export const legalNav = [
  { href: "/privacy", label: en.nav.privacy },
  { href: "/terms", label: en.nav.terms },
] as const;
