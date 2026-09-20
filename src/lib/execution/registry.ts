"use client";

import { MockAdapter } from "@/lib/execution/mock-adapter";
import { WasmAdapter } from "@/lib/execution/wasm-adapter";
import type { ExecutionAdapter, ZigChannel } from "@/lib/execution/types";
import { playVersion } from "@/lib/zig-version";

type Slot = { channel: ZigChannel; adapter: ExecutionAdapter; refs: number };

let current: Slot | null = null;
let disposeTimer: ReturnType<typeof setTimeout> | null = null;

function createAdapter(channel: ZigChannel): ExecutionAdapter {
  const row = playVersion(channel);
  if (!row) {
    return new MockAdapter(channel);
  }
  return new WasmAdapter({
    channel,
    artifacts: {
      moduleUrl: row.moduleUrl,
      stdUrl: row.stdUrl,
      compilerRtUrl: row.compilerRtUrl,
    },
    compileTimeoutMs: row.compileTimeoutMs,
    runTimeoutMs: row.runTimeoutMs,
  });
}

function clearDisposeTimer() {
  if (!disposeTimer) return;
  clearTimeout(disposeTimer);
  disposeTimer = null;
}

function disposeSlot(slot: Slot) {
  slot.adapter.dispose?.();
  if (current === slot) current = null;
}

export function acquireAdapter(channel: ZigChannel): ExecutionAdapter {
  if (typeof window === "undefined") {
    return new MockAdapter(channel);
  }
  if (current?.channel === channel) {
    current.refs += 1;
    clearDisposeTimer();
    return current.adapter;
  }
  clearDisposeTimer();
  if (current) disposeSlot(current);
  current = { channel, adapter: createAdapter(channel), refs: 1 };
  return current.adapter;
}

export function releaseAdapter(channel: ZigChannel): void {
  if (!current || current.channel !== channel) return;
  current.refs -= 1;
  if (current.refs > 0) return;
  const slot = current;
  clearDisposeTimer();
  // Defer so React Strict Mode remount can re-acquire the same worker.
  disposeTimer = setTimeout(() => {
    disposeTimer = null;
    if (current !== slot || current.refs > 0) return;
    disposeSlot(slot);
  }, 0);
}
