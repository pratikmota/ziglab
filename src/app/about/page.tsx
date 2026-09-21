import {
  ContentSection,
  PageHeader,
  Prose,
  proseLinkClass,
} from "@/components/content/Prose";
import { CreatorCard } from "@/components/about/CreatorCard";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.about,
  description: en.about.lead,
  path: "/about",
});

export default function AboutPage() {
  return (
    <Prose>
      <PageHeader title={en.about.title} description={en.about.lead} />

      <ContentSection title={en.about.whatTitle}>
        <p>{en.about.whatBody}</p>
      </ContentSection>

      <ContentSection title={en.about.notTitle}>
        <p>{en.about.notBody}</p>
      </ContentSection>

      <ContentSection title={en.about.whyTitle}>
        <p>{en.about.whyBody}</p>
      </ContentSection>

      <ContentSection title={en.about.creatorTitle}>
        <CreatorCard />
      </ContentSection>

      <ContentSection title={en.about.contributeTitle}>
        <p>{en.about.contributeBody}</p>
        <p>
          <a
            href={siteConfig.github}
            className={proseLinkClass}
            {...externalLinkProps}
          >
            {en.community.github}
          </a>
        </p>
      </ContentSection>

      <ContentSection title={en.about.communityTitle}>
        <p>{en.about.communityBody}</p>
      </ContentSection>

      <ContentSection title={en.about.courtesyTitle}>
        <p>
          <a
            href={siteConfig.zigOfficial}
            className={proseLinkClass}
            {...externalLinkProps}
          >
            {en.about.zigLink}
          </a>
        </p>
      </ContentSection>
    </Prose>
  );
}
