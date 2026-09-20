import { Community } from "@/components/home/Community";
import { CurriculumPreview } from "@/components/home/CurriculumPreview";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PlaygroundTeaser } from "@/components/home/PlaygroundTeaser";
import { SponsorsStrip } from "@/components/home/SponsorsStrip";
import { siteConfig } from "@/config/site";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.homeTitle,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <CurriculumPreview />
      <PlaygroundTeaser />
      <Community />
      <SponsorsStrip />
    </>
  );
}
