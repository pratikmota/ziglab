"use client";

import { useEffect, useState } from "react";

import { Playground } from "@/components/playground/Playground";
import { PLAYGROUND_HELLO_SOURCE } from "@/lib/content/hello-zig";
import { getAdapter } from "@/lib/execution/registry";
import type { ZigChannel } from "@/lib/execution/types";
import { usePlayDraft, writePlayDraft } from "@/lib/play-draft";
import { offeredZigChannel } from "@/lib/zig-version";

export function PlaygroundClient() {
  const draft = usePlayDraft();
  const [local, setLocal] = useState<{
    code: string;
    channel: ZigChannel;
  } | null>(null);

  const code = local?.code ?? draft.code;
  const channel = offeredZigChannel(local?.channel ?? draft.channel);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      writePlayDraft({ code, channel });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [code, channel]);

  return (
    <Playground
      source={code}
      channel={channel}
      onChange={(next) => setLocal({ code: next, channel })}
      onChannelChange={(next) => setLocal({ code, channel: next })}
      adapter={getAdapter(channel)}
      template={PLAYGROUND_HELLO_SOURCE}
      reportContext={{ kind: "playground" }}
      showNew
    />
  );
}
