"use client";

import { useSyncExternalStore } from "react";

export const PROGRESS_KEY = "ziglab.progress.v1";
export const QUIZ_KEY = "ziglab.quiz.v1";

export type ProgressState = {
  completed: string[];
  lastLesson: string;
  updatedAt: string;
};

export type QuizRecord = {
  answers: Record<string, string>;
  score: number;
};

export type QuizStore = Record<string, QuizRecord>;

const emptyProgress: ProgressState = {
  completed: [],
  lastLesson: "",
  updatedAt: "",
};

const emptyQuizStore: QuizStore = {};

let progressCache: ProgressState | null = null;
let quizCache: QuizStore | null = null;

function canUseStorage() {
  return typeof window !== "undefined";
}

function invalidateCache() {
  progressCache = null;
  quizCache = null;
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  invalidateCache();
  window.dispatchEvent(new Event("ziglab-storage"));
}

export function readProgress(): ProgressState {
  if (progressCache) {
    return progressCache;
  }

  const parsed = readJson<Partial<ProgressState>>(PROGRESS_KEY, emptyProgress);

  progressCache = {
    completed: Array.isArray(parsed.completed)
      ? parsed.completed.filter((id): id is string => typeof id === "string")
      : [],
    lastLesson: typeof parsed.lastLesson === "string" ? parsed.lastLesson : "",
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
  };

  return progressCache;
}

function writeProgress(next: ProgressState) {
  writeJson(PROGRESS_KEY, {
    ...next,
    updatedAt: new Date().toISOString(),
  });
}

export function markLessonOpened(lessonId: string) {
  const current = readProgress();
  writeProgress({
    ...current,
    lastLesson: lessonId,
  });
}

export function markLessonComplete(lessonId: string) {
  const current = readProgress();
  const completed = current.completed.includes(lessonId)
    ? current.completed
    : [...current.completed, lessonId];

  writeProgress({
    ...current,
    completed,
    lastLesson: current.lastLesson || lessonId,
  });
}

export function isLessonComplete(lessonId: string, progress = readProgress()) {
  return progress.completed.includes(lessonId);
}

export function readQuizStore(): QuizStore {
  if (quizCache) {
    return quizCache;
  }

  const parsed = readJson<QuizStore>(QUIZ_KEY, emptyQuizStore);
  quizCache = parsed && typeof parsed === "object" ? parsed : emptyQuizStore;
  return quizCache;
}

export function readQuizRecord(lessonId: string): QuizRecord | null {
  const record = readQuizStore()[lessonId];
  if (!record || typeof record !== "object") {
    return null;
  }

  return {
    answers:
      record.answers && typeof record.answers === "object" ? record.answers : {},
    score: typeof record.score === "number" ? record.score : 0,
  };
}

export function writeQuizRecord(lessonId: string, record: QuizRecord) {
  const store = readQuizStore();
  writeJson(QUIZ_KEY, {
    ...store,
    [lessonId]: record,
  });
}

export function subscribeStorage(onStoreChange: () => void) {
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

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribeStorage, readProgress, () => emptyProgress);
}

export function useQuizRecord(lessonId: string): QuizRecord | null {
  const store = useSyncExternalStore(
    subscribeStorage,
    readQuizStore,
    () => emptyQuizStore
  );
  return store[lessonId] ?? null;
}
