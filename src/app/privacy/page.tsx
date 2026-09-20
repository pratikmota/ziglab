import {
  ContentSection,
  PageHeader,
  Prose,
  proseLinkClass,
} from "@/components/content/Prose";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.privacy,
  description: en.privacy.intro,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Prose>
      <PageHeader title={en.privacy.title} description={en.privacy.intro} />

      <ContentSection title={en.privacy.accountsTitle}>
        <p>{en.privacy.accountsBody}</p>
      </ContentSection>

      <ContentSection title={en.privacy.storageTitle}>
        <p>{en.privacy.storageBody}</p>
      </ContentSection>

      <ContentSection title={en.privacy.dataTitle}>
        <p>{en.privacy.dataBody}</p>
      </ContentSection>

      <ContentSection title={en.privacy.thirdTitle}>
        <p>{en.privacy.thirdBody}</p>
      </ContentSection>

      <ContentSection title={en.privacy.analyticsTitle}>
        <p>{en.privacy.analyticsBody}</p>
      </ContentSection>

      <ContentSection title={en.privacy.contactTitle}>
        <p>{en.privacy.contactBody}</p>
        <p>
          <a
            href={siteConfig.githubIssues}
            className={proseLinkClass}
            {...externalLinkProps}
          >
            {en.privacy.issues}
          </a>
        </p>
      </ContentSection>
    </Prose>
  );
}
