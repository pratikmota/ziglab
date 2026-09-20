import { en } from "@/lib/i18n/en";

export const mainNav = [
  { href: "/learn", label: en.nav.learn },
  { href: "/play", label: en.nav.play },
  { href: "/blog", label: en.nav.blog },
  { href: "/sponsors", label: en.nav.sponsors },
] as const;

export const footerNav = [
  ...mainNav,
  { href: "/about", label: en.nav.about },
] as const;

export const legalNav = [
  { href: "/privacy", label: en.nav.privacy },
  { href: "/terms", label: en.nav.terms },
] as const;
