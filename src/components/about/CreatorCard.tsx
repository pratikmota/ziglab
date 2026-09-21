import Image from "next/image";

import { proseLinkClass } from "@/components/content/Prose";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";

function ProfileLink({ href, label }: { href: string; label: string }) {
  if (!href) {
    return null;
  }

  return (
    <a href={href} className={proseLinkClass} {...externalLinkProps}>
      {label}
    </a>
  );
}

export function CreatorCard() {
  const { maintainer } = siteConfig;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
      <Image
        src={maintainer.photo}
        alt={maintainer.name}
        width={96}
        height={96}
        className="size-24 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{maintainer.role}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">
          {maintainer.name}
        </p>
        <p className="mt-2 text-muted-foreground">{maintainer.bio}</p>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <ProfileLink href={maintainer.github} label={en.about.github} />
          <ProfileLink href={maintainer.x} label={en.about.x} />
          <ProfileLink href={maintainer.mastodon} label={en.about.mastodon} />
          <ProfileLink href={maintainer.linkedin} label={en.about.linkedin} />
        </p>
      </div>
    </div>
  );
}
