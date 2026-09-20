import { PlaygroundClient } from "@/components/playground/PlaygroundClient";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = routeMetadata({
  title: en.meta.play,
  description: en.play.pageDescription,
  path: "/play",
});

export default function PlayPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PlaygroundClient />
    </div>
  );
}
