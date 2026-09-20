import { Community } from "@/components/home/Community";
import { CurriculumPreview } from "@/components/home/CurriculumPreview";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PlaygroundTeaser } from "@/components/home/PlaygroundTeaser";
import { SponsorsStrip } from "@/components/home/SponsorsStrip";

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
