import type { Metadata } from "next";

import { siteConfig } from "@/config/site";

export function routeMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const isHome = path === "/";
  const url = isHome ? siteConfig.domain : `${siteConfig.domain}${path}`;
  const openGraphTitle = isHome ? title : `${title} — ${siteConfig.name}`;

  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: openGraphTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
    },
  };
}
