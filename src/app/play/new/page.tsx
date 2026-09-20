import { NewPlaygroundClient } from "@/components/playground/NewPlaygroundClient";
import { en } from "@/lib/i18n/en";
import { routeMetadata } from "@/lib/seo";

export const metadata = {
  ...routeMetadata({
    title: en.meta.play,
    description: en.play.pageDescription,
    path: "/play",
  }),
  robots: { index: false, follow: false },
};

export default function NewPlayPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <NewPlaygroundClient />
    </div>
  );
}
