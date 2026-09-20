import {
  ContentSection,
  PageHeader,
  Prose,
} from "@/components/content/Prose";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.terms,
  description: en.terms.intro,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Prose>
      <PageHeader title={en.terms.title} description={en.terms.intro} />

      <ContentSection title={en.terms.asIsTitle}>
        <p>{en.terms.asIsBody}</p>
      </ContentSection>

      <ContentSection title={en.terms.codeTitle}>
        <p>{en.terms.codeBody}</p>
      </ContentSection>

      <ContentSection title={en.terms.licenseTitle}>
        <p>{en.terms.licenseBody}</p>
      </ContentSection>

      <ContentSection title={en.terms.marksTitle}>
        <p>{en.terms.marksBody}</p>
      </ContentSection>
    </Prose>
  );
}
