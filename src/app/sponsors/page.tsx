import { PageHeader, Prose } from "@/components/content/Prose";
import { SponsorLogoWall } from "@/components/sponsors/SponsorLogoWall";
import { Button } from "@/components/ui/button";
import { siteConfig, externalLinkProps } from "@/config/site";
import { getSponsors, hasAnySponsors } from "@/lib/content/sponsors";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.sponsors,
  description: en.sponsors.pageLead,
  path: "/sponsors",
});

export default function SponsorsPage() {
  const sponsors = getSponsors();

  return (
    <Prose>
      <PageHeader
        title={en.sponsors.pageTitle}
        description={en.sponsors.pageLead}
      />

      <section>
        <h2 className="text-xl font-semibold tracking-tight">
          {en.sponsors.whyTitle}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7">
          <li>{en.sponsors.whyHosting}</li>
          <li>{en.sponsors.whyWasm}</li>
          <li>{en.sponsors.whyLessons}</li>
        </ul>
      </section>

      <div className="mt-8">
        <Button
          size="lg"
          nativeButton={false}
          render={
            <a href={siteConfig.sponsorsGithub} {...externalLinkProps} />
          }
        >
          {en.sponsors.githubCta}
        </Button>
      </div>

      <p className="mt-6 leading-7 text-pretty text-muted-foreground">
        {en.sponsors.thanks}
      </p>

      {hasAnySponsors(sponsors) ? (
        <SponsorLogoWall sponsors={sponsors} />
      ) : null}
    </Prose>
  );
}
