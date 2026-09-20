"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { en } from "@/lib/i18n/en";

function youtubeIdFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.searchParams.get("v")) {
        return parsed.searchParams.get("v") ?? "";
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] ?? "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function VideoEmbed({ url }: { url: string }) {
  const videoId = youtubeIdFromUrl(url);
  const [open, setOpen] = useState<string[]>([]);
  const [playing, setPlaying] = useState(false);

  if (!url || !videoId) {
    return null;
  }

  function handleValueChange(value: string[]) {
    setOpen(value);
    if (!value.includes("walkthrough")) {
      setPlaying(false);
    }
  }

  return (
    <Accordion
      className="mt-8 rounded-xl border border-line px-4"
      value={open}
      onValueChange={handleValueChange}
    >
      <AccordionItem value="walkthrough">
        <AccordionTrigger>{en.learn.video}</AccordionTrigger>
        <AccordionContent>
          {playing ? (
            <iframe
              title={en.learn.video}
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`}
              className="aspect-video w-full rounded-lg border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <Button type="button" onClick={() => setPlaying(true)}>
              {en.learn.videoPlay}
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
