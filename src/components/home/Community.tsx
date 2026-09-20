import { GitHubIcon } from "@/components/icons/GitHubIcon";
import { Button } from "@/components/ui/button";
import { siteConfig, externalLinkProps } from "@/config/site";
import { en } from "@/lib/i18n/en";

export function Community() {
  return (
    <section className="bg-bg-elevated">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {en.community.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{en.community.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            nativeButton={false}
            render={<a href={siteConfig.github} {...externalLinkProps} />}
          >
            <GitHubIcon data-icon="inline-start" />
            {en.community.github}
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={siteConfig.githubIssues} {...externalLinkProps} />}
          >
            {en.community.report}
          </Button>
        </div>
      </div>
    </section>
  );
}
