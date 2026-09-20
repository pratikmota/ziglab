import {
  comingFromLangs,
  type ComingFrom,
} from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";

export function ComingFromCallout({ comingFrom }: { comingFrom: ComingFrom }) {
  const entries = comingFromLangs.flatMap((lang) => {
    const text = comingFrom[lang];
    return text ? [{ lang, text }] : [];
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-3">
      {entries.map((entry) => (
        <aside
          key={entry.lang}
          className="rounded-xl border border-line bg-bg-elevated p-4"
        >
          <p className="text-sm font-medium">{en.learn.comingFrom[entry.lang]}</p>
          <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
            {entry.text}
          </p>
        </aside>
      ))}
    </div>
  );
}
