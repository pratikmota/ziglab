import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { chapters, type ChapterLevel } from "@content/curriculum";
import {
  comingFromLangs,
  lessonTypes,
  type ComingFrom,
  type ComingFromLang,
  type Lesson,
  type LessonMeta,
  type LessonType,
  type QuizItem,
} from "@/lib/content/lesson-model";

export {
  comingFromLangs,
  getLessonHref,
  lessonTypes,
  type ComingFrom,
  type ComingFromLang,
  type Lesson,
  type LessonMeta,
  type LessonType,
  type QuizItem,
  type QuizOption,
} from "@/lib/content/lesson-model";

const LESSONS_DIR = path.join(process.cwd(), "content/lessons");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const chapterOrder = new Map(chapters.map((chapter) => [chapter.id, chapter.order]));
const chapterLevels = new Map(chapters.map((chapter) => [chapter.id, chapter.level]));

function isSafeSegment(value: string) {
  return SLUG_PATTERN.test(value);
}

function resolveUnder(root: string, ...parts: string[]) {
  const resolvedRoot = path.resolve(root);
  const filePath = path.resolve(resolvedRoot, ...parts);
  const relative = path.relative(resolvedRoot, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return filePath;
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseComingFrom(value: unknown, lessonId: string): ComingFrom {
  if (value == null || value === "") {
    return {};
  }

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Lesson "${lessonId}" has invalid comingFrom.`);
  }

  const result: ComingFrom = {};

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (!comingFromLangs.includes(key as ComingFromLang)) {
      throw new Error(`Lesson "${lessonId}" has unknown comingFrom key "${key}".`);
    }

    if (typeof entry === "string" && entry.trim()) {
      result[key as ComingFromLang] = entry.trim();
    }
  }

  return result;
}

function parseQuiz(value: unknown, lessonId: string, type: LessonType): QuizItem[] {
  if (type !== "quiz") {
    if (Array.isArray(value) && value.length > 0) {
      throw new Error(`Lesson "${lessonId}" is not a quiz but has quiz items.`);
    }
    return [];
  }

  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Quiz "${lessonId}" needs at least one question.`);
  }

  return value.map((raw, index) => {
    if (!raw || typeof raw !== "object") {
      throw new Error(`Quiz "${lessonId}" question ${index + 1} is invalid.`);
    }

    const item = raw as Record<string, unknown>;
    const id = asString(item.id);
    const prompt = asString(item.prompt);
    const answer = asString(item.answer);

    if (!id || !prompt || !answer) {
      throw new Error(`Quiz "${lessonId}" question ${index + 1} is missing id, prompt, or answer.`);
    }

    if (!Array.isArray(item.options) || item.options.length < 2) {
      throw new Error(`Quiz "${lessonId}" question "${id}" needs at least two options.`);
    }

    const options = item.options.map((option, optionIndex) => {
      if (!option || typeof option !== "object") {
        throw new Error(`Quiz "${lessonId}" question "${id}" option ${optionIndex + 1} is invalid.`);
      }

      const parsed = option as Record<string, unknown>;
      const optionId = asString(parsed.id);
      const text = asString(parsed.text);

      if (!optionId || !text) {
        throw new Error(`Quiz "${lessonId}" question "${id}" has an incomplete option.`);
      }

      return { id: optionId, text };
    });

    if (!options.some((option) => option.id === answer)) {
      throw new Error(`Quiz "${lessonId}" question "${id}" answer "${answer}" is not an option.`);
    }

    const explainRaw = item.explain;
    if (!explainRaw || typeof explainRaw !== "object" || Array.isArray(explainRaw)) {
      throw new Error(`Quiz "${lessonId}" question "${id}" is missing explain.`);
    }

    const explain: Record<string, string> = {};
    for (const option of options) {
      const text = asString((explainRaw as Record<string, unknown>)[option.id]);
      if (!text) {
        throw new Error(`Quiz "${lessonId}" question "${id}" is missing explain.${option.id}.`);
      }
      explain[option.id] = text;
    }

    return { id, prompt, options, answer, explain };
  });
}

function parseHints(value: unknown, lessonId: string): string[] {
  if (value == null || value === "") {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`Lesson "${lessonId}" has invalid hints.`);
  }

  return value.map((item, index) => {
    const text = asString(item);
    if (!text) {
      throw new Error(`Lesson "${lessonId}" hint ${index + 1} is empty.`);
    }
    return text;
  });
}

function parseLesson(chapter: string, slug: string, raw: string): Lesson {
  const { data, content } = matter(raw);
  const lessonId = `${chapter}/${slug}`;
  const type = asString(data.type) as LessonType;

  if (!lessonTypes.includes(type)) {
    throw new Error(`Lesson "${lessonId}" has invalid type.`);
  }

  if (typeof data.title !== "string" || typeof data.description !== "string") {
    throw new Error(`Lesson "${lessonId}" is missing title or description.`);
  }

  if (typeof data.order !== "number" || !Number.isInteger(data.order)) {
    throw new Error(`Lesson "${lessonId}" is missing a numeric order.`);
  }

  const level = (asString(data.level) || chapterLevels.get(chapter) || "") as ChapterLevel;
  if (level !== "start" && level !== "core" && level !== "advanced") {
    throw new Error(`Lesson "${lessonId}" has invalid level.`);
  }

  const starterFile = asString(data.starterFile);
  if ((type === "concept" || type === "quiz") && starterFile) {
    throw new Error(`Lesson "${lessonId}" is ${type} and must not have starterFile.`);
  }
  if ((type === "try" || type === "challenge") && !starterFile) {
    throw new Error(`Lesson "${lessonId}" is ${type} and needs starterFile.`);
  }
  if (starterFile) {
    const zigPath = resolveUnder(LESSONS_DIR, chapter, starterFile);
    if (!zigPath || !fs.existsSync(zigPath)) {
      throw new Error(`Lesson "${lessonId}" starter "${starterFile}" is missing.`);
    }
  }

  const frontId = asString(data.id) || lessonId;
  if (frontId !== lessonId) {
    throw new Error(`Lesson "${lessonId}" id "${frontId}" does not match path.`);
  }

  if (asString(data.chapter) && asString(data.chapter) !== chapter) {
    throw new Error(`Lesson "${lessonId}" chapter does not match folder.`);
  }

  if (asString(data.slug) && asString(data.slug) !== slug) {
    throw new Error(`Lesson "${lessonId}" slug does not match filename.`);
  }

  return {
    id: lessonId,
    chapter,
    slug,
    type,
    title: data.title,
    description: data.description,
    order: data.order,
    level,
    videoUrl: asString(data.videoUrl),
    docsUrl: asString(data.docsUrl),
    starterFile,
    comingFrom: parseComingFrom(data.comingFrom, lessonId),
    hints: parseHints(data.hints, lessonId),
    expectedOutput: asString(data.expectedOutput),
    quiz: parseQuiz(data.quiz, lessonId, type),
    content,
  };
}

export function getLesson(chapter: string, slug: string): Lesson | null {
  if (!isSafeSegment(chapter) || !isSafeSegment(slug) || !chapterOrder.has(chapter)) {
    return null;
  }

  const filePath = resolveUnder(LESSONS_DIR, chapter, `${slug}.mdx`);
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }

  return parseLesson(chapter, slug, fs.readFileSync(filePath, "utf8"));
}

export function listLessons(): LessonMeta[] {
  if (!fs.existsSync(LESSONS_DIR)) {
    return [];
  }

  const lessons: Lesson[] = [];

  for (const chapter of chapters) {
    const chapterDir = resolveUnder(LESSONS_DIR, chapter.id);
    if (!chapterDir || !fs.existsSync(chapterDir)) {
      continue;
    }

    for (const file of fs.readdirSync(chapterDir)) {
      if (!file.endsWith(".mdx")) {
        continue;
      }

      const slug = file.replace(/\.mdx$/, "");
      const lesson = getLesson(chapter.id, slug);
      if (lesson) {
        lessons.push(lesson);
      }
    }
  }

  return lessons
    .sort((a, b) => {
      const chapterDiff =
        (chapterOrder.get(a.chapter) ?? 0) - (chapterOrder.get(b.chapter) ?? 0);
      if (chapterDiff !== 0) {
        return chapterDiff;
      }
      return a.order - b.order;
    })
    .map(
      ({
        id,
        chapter,
        slug,
        type,
        title,
        description,
        order,
        level,
        videoUrl,
        docsUrl,
        starterFile,
        comingFrom,
        hints,
        expectedOutput,
        quiz,
      }) => ({
        id,
        chapter,
        slug,
        type,
        title,
        description,
        order,
        level,
        videoUrl,
        docsUrl,
        starterFile,
        comingFrom,
        hints,
        expectedOutput,
        quiz,
      })
    );
}

export function readStarterSource(lesson: Pick<LessonMeta, "id" | "chapter" | "starterFile">) {
  if (!lesson.starterFile) {
    throw new Error(`Lesson "${lesson.id}" has no starterFile.`);
  }

  const filePath = resolveUnder(LESSONS_DIR, lesson.chapter, lesson.starterFile);
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`Lesson "${lesson.id}" starter "${lesson.starterFile}" is missing.`);
  }

  return fs.readFileSync(filePath, "utf8");
}

export function getAdjacentLessons(lessonId: string) {
  const lessons = listLessons();
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);

  return {
    previous: index > 0 ? lessons[index - 1] : null,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null,
  };
}

export function lessonsForChapter(chapterId: string) {
  return listLessons().filter((lesson) => lesson.chapter === chapterId);
}
