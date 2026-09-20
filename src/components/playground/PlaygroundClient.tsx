"use client";

import { Playground } from "@/components/playground/Playground";
import { useEditorSession } from "@/components/playground/use-editor-session";
import { siteConfig } from "@/config/site";
import { PLAYGROUND_HELLO_SOURCE } from "@/lib/content/hello-zig";
import { getAdapter } from "@/lib/execution/registry";
import { usePlayDraft, writePlayDraft } from "@/lib/play-draft";
import { playgroundReportUrl } from "@/lib/report";

export function PlaygroundClient() {
  const draft = usePlayDraft();
  const { code, channel, setCode, setChannel } = useEditorSession({
    stored: draft,
    fallbackCode: PLAYGROUND_HELLO_SOURCE,
    persist: writePlayDraft,
  });

  return (
    <Playground
      source={code}
      channel={channel}
      onChange={setCode}
      onChannelChange={setChannel}
      adapter={getAdapter(channel)}
      template={PLAYGROUND_HELLO_SOURCE}
      chrome={{
        showFormat: true,
        newHref: "/play/new",
        reportHref: playgroundReportUrl(`${siteConfig.domain}/play`, channel),
      }}
    />
  );
}
