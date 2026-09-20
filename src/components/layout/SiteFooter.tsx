"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";

export function SiteFooter() {
  const pathname = usePathname();
  const compact = pathname === "/play" || pathname.startsWith("/play/");

  return <Footer compact={compact} />;
}
