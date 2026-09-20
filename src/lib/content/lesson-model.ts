import type { ChapterLevel } from "@content/curriculum";

export const lessonTypes = ["concept", "try", "challenge", "quiz"] as const;
export type LessonType = (typeof lessonTypes)[number];

export const comingFromLangs = ["c", "rust", "go"] as const;
export type ComingFromLang = (typeof comingFromLangs)[number];

export type ComingFrom = Partial<Record<ComingFromLang, string>>;

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizItem = {
  id: string;
  prompt: string;
  options: QuizOption[];
  answer: string;
  explain: Record<string, string>;
};

export type LessonMeta = {
  id: string;
  chapter: string;
  slug: string;
  type: LessonType;
  title: string;
  description: string;
  order: number;
  level: ChapterLevel;
  videoUrl: string;
  docsUrl: string;
  starterFile: string;
  comingFrom: ComingFrom;
  quiz: QuizItem[];
};

export type Lesson = LessonMeta & {
  content: string;
};

export function getLessonHref(lesson: Pick<LessonMeta, "chapter" | "slug">) {
  return `/learn/${lesson.chapter}/${lesson.slug}`;
}
