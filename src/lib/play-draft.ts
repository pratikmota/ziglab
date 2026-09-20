"use client";

import { useSyncExternalStore } from "react";

import { PLAYGROUND_HELLO_SOURCE } from "@/lib/content/hello-zig";
import type { ZigChannel } from "@/lib/execution/types";
import { offeredZigChannel } from "@/lib/zig-version";

export const PLAY_DRAFT_KEY = "ziglab.play.draft.v1";

export type PlayDraft = {
  code: string;
  channel: ZigChannel;
  updatedAt: string;
};

const defaultDraft: PlayDraft = {
  code: PLAYGROUND_HELLO_SOURCE,
  channel: "stable",
  updatedAt: "",
};

let draftCache: PlayDraft | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function invalidateCache() {
  draftCache = null;
}

function isChannel(value: unknown): value is ZigChannel {
  return value === "stable" || value === "master";
}

export function readPlayDraft(): PlayDraft {
  if (draftCache) {
    return draftCache;
  }

  if (!canUseStorage()) {
    draftCache = defaultDraft;
    return draftCache;
  }

  try {
    const raw = window.localStorage.getItem(PLAY_DRAFT_KEY);
    if (!raw) {
      draftCache = defaultDraft;
      return draftCache;
    }

    const parsed = JSON.parse(raw) as Partial<PlayDraft>;
    draftCache = {
      code: typeof parsed.code === "string" ? parsed.code : defaultDraft.code,
      channel: offeredZigChannel(
        isChannel(parsed.channel) ? parsed.channel : defaultDraft.channel
      ),
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
    };
    return draftCache;
  } catch {
    draftCache = defaultDraft;
    return draftCache;
  }
}

export function writePlayDraft(next: Pick<PlayDraft, "code" | "channel">) {
  if (!canUseStorage()) {
    return;
  }

  const value: PlayDraft = {
    code: next.code,
    channel: offeredZigChannel(next.channel),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(PLAY_DRAFT_KEY, JSON.stringify(value));
  invalidateCache();
  window.dispatchEvent(new Event("ziglab-storage"));
}

export function subscribePlayDraft(onStoreChange: () => void) {
  if (!canUseStorage()) {
    return () => {};
  }

  const onChange = () => {
    invalidateCache();
    onStoreChange();
  };
  window.addEventListener("storage", onChange);
  window.addEventListener("ziglab-storage", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("ziglab-storage", onChange);
  };
}

export function usePlayDraft(): PlayDraft {
  return useSyncExternalStore(
    subscribePlayDraft,
    readPlayDraft,
    () => defaultDraft
  );
}
