"use client";

import { useEffect, useRef, useState } from "react";

import type { ZigChannel } from "@/lib/execution/types";
import { DEFAULT_ZIG_CHANNEL, offeredZigChannel } from "@/lib/zig-version";

export type EditorSessionValue = {
  code: string;
  channel: ZigChannel;
};

export function useEditorSession({
  sessionKey,
  stored,
  fallbackCode,
  fallbackChannel = DEFAULT_ZIG_CHANNEL,
  persist,
}: {
  sessionKey?: string;
  stored?: EditorSessionValue | null;
  fallbackCode: string;
  fallbackChannel?: ZigChannel;
  persist: (next: EditorSessionValue) => void;
}) {
  const [local, setLocal] = useState<EditorSessionValue | null>(null);
  const [prevKey, setPrevKey] = useState(sessionKey);
  const persistRef = useRef(persist);

  if (sessionKey !== prevKey) {
    setPrevKey(sessionKey);
    setLocal(null);
  }

  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  const code = local?.code ?? stored?.code ?? fallbackCode;
  const channel = offeredZigChannel(
    local?.channel ?? stored?.channel ?? fallbackChannel
  );

  useEffect(() => {
    if (!local) {
      return;
    }

    const timeout = window.setTimeout(() => {
      persistRef.current({ code: local.code, channel: local.channel });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [local]);

  return {
    code,
    channel,
    setCode: (next: string) => setLocal({ code: next, channel }),
    setChannel: (next: ZigChannel) => setLocal({ code, channel: next }),
  };
}
