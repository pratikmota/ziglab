"use client";

import { ZigPlayEditor } from "@/components/playground/ZigPlayEditor";
import { useEditorSession } from "@/components/playground/use-editor-session";
import { siteConfig } from "@/config/site";
import { PLAYGROUND_HELLO_SOURCE } from "@/lib/content/hello-zig";
import { usePlayDraft, writePlayDraft } from "@/lib/play-draft";
import { playgroundReportUrl } from "@/lib/report";

export function PlaygroundClient() {
  const draft = usePlayDraft();
  const { code, channel, setCode } = useEditorSession({
    stored: draft,
    fallbackCode: PLAYGROUND_HELLO_SOURCE,
    persist: writePlayDraft,
  });

  return (
    <ZigPlayEditor
      code={code}
      channel={channel}
      onChange={setCode}
      template={PLAYGROUND_HELLO_SOURCE}
      newHref="/play/new"
      reportHref={playgroundReportUrl(`${siteConfig.domain}/play`, channel)}
    />
  );
}
