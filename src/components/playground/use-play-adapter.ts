"use client";

import { useEffect, useState } from "react";

import { MockAdapter } from "@/lib/execution/mock-adapter";
import { acquireAdapter, releaseAdapter } from "@/lib/execution/registry";
import type { ExecutionAdapter, ZigChannel } from "@/lib/execution/types";

/** Same adapter on SSR and the first client paint (avoids hydration mismatch). */
export function usePlayAdapter(channel: ZigChannel): ExecutionAdapter {
  const [adapter, setAdapter] = useState<ExecutionAdapter>(
    () => new MockAdapter(channel),
  );

  useEffect(() => {
    let cancelled = false;
    let held: ZigChannel | null = null;
    void Promise.resolve().then(() => {
      if (cancelled) return;
      held = channel;
      setAdapter(acquireAdapter(channel));
    });
    return () => {
      cancelled = true;
      if (held) releaseAdapter(held);
    };
  }, [channel]);

  return adapter;
}
