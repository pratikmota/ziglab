"use client";

import { useSyncExternalStore } from "react";

import type { ZigChannel } from "@/lib/execution/types";
import { offeredZigChannel } from "@/lib/zig-version";

export const LESSON_DRAFT_KEY = "ziglab.lesson.draft.v1";

export type LessonDraftEntry = {
  code: string;
  channel: ZigChannel;
  updatedAt: string;
};

export type LessonDraftStore = Record<string, LessonDraftEntry>;

const emptyStore: LessonDraftStore = {};

let draftCache: LessonDraftStore | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function invalidateCache() {
  draftCache = null;
}

function isChannel(value: unknown): value is ZigChannel {
  return value === "stable" || value === "master";
}

export function readLessonDraftStore(): LessonDraftStore {
  if (draftCache) {
    return draftCache;
  }

  if (!canUseStorage()) {
    draftCache = emptyStore;
    return draftCache;
  }

  try {
    const raw = window.localStorage.getItem(LESSON_DRAFT_KEY);
    if (!raw) {
      draftCache = emptyStore;
      return draftCache;
    }

    const parsed = JSON.parse(raw) as LessonDraftStore;
    if (!parsed || typeof parsed !== "object") {
      draftCache = emptyStore;
      return draftCache;
    }

    const next: LessonDraftStore = {};
    for (const [lessonId, entry] of Object.entries(parsed)) {
      if (!entry || typeof entry !== "object") {
        continue;
      }
      if (typeof entry.code !== "string") {
        continue;
      }
      next[lessonId] = {
        code: entry.code,
        channel: offeredZigChannel(
          isChannel(entry.channel) ? entry.channel : "stable"
        ),
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
      };
    }

    draftCache = next;
    return draftCache;
  } catch {
    draftCache = emptyStore;
    return draftCache;
  }
}

export function readLessonDraft(lessonId: string): LessonDraftEntry | null {
  return readLessonDraftStore()[lessonId] ?? null;
}

export function writeLessonDraft(
  lessonId: string,
  next: Pick<LessonDraftEntry, "code" | "channel">
) {
  if (!canUseStorage()) {
    return;
  }

  const store = readLessonDraftStore();
  const value: LessonDraftStore = {
    ...store,
    [lessonId]: {
      code: next.code,
      channel: offeredZigChannel(next.channel),
      updatedAt: new Date().toISOString(),
    },
  };
  window.localStorage.setItem(LESSON_DRAFT_KEY, JSON.stringify(value));
  invalidateCache();
  window.dispatchEvent(new Event("ziglab-storage"));
}

export function clearLessonDrafts() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(LESSON_DRAFT_KEY);
  invalidateCache();
  window.dispatchEvent(new Event("ziglab-storage"));
}

export function subscribeLessonDraft(onStoreChange: () => void) {
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

export function useLessonDraft(lessonId: string): LessonDraftEntry | null {
  const store = useSyncExternalStore(
    subscribeLessonDraft,
    readLessonDraftStore,
    () => emptyStore
  );
  return store[lessonId] ?? null;
}
