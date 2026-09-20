"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { QuizItem } from "@/lib/content/lesson-model";
import { en } from "@/lib/i18n/en";
import {
  markLessonComplete,
  useQuizRecord,
  writeQuizRecord,
} from "@/lib/progress";
import { cn } from "@/lib/utils";

export function Quiz({
  lessonId,
  items,
}: {
  lessonId: string;
  items: QuizItem[];
}) {
  const record = useQuizRecord(lessonId);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [editing, setEditing] = useState(false);

  const submitted = Boolean(record) && !editing;
  const answers = draft ?? record?.answers ?? {};
  const score = record?.score ?? 0;
  const allAnswered = items.every((item) => answers[item.id]);
  const radioName = lessonId.replace(/\//g, "-");

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) {
      return;
    }

    setDraft({ ...answers, [questionId]: optionId });
  }

  function handleSubmit() {
    if (!allAnswered) {
      return;
    }

    const nextScore = items.filter((item) => answers[item.id] === item.answer)
      .length;

    writeQuizRecord(lessonId, { answers, score: nextScore });
    markLessonComplete(lessonId);
    setEditing(false);
    setDraft(null);
  }

  function handleRetry() {
    setDraft(record?.answers ?? {});
    setEditing(true);
  }

  return (
    <div className="mt-8 space-y-8">
      {items.map((item, index) => (
        <fieldset key={item.id} className="space-y-3">
          <legend className="text-base font-medium">
            <span className="font-mono text-sm text-muted-foreground">
              {index + 1}.
            </span>{" "}
            {item.prompt}
          </legend>
          <div className="space-y-2">
            {item.options.map((option) => {
              const selected = answers[item.id] === option.id;
              const correct = option.id === item.answer;

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-line bg-bg-elevated p-3 text-sm leading-6",
                    submitted ? "cursor-default" : "cursor-pointer",
                    selected && !submitted && "border-primary",
                    submitted && correct && "border-success",
                    submitted && selected && !correct && "border-destructive"
                  )}
                >
                  <input
                    type="radio"
                    name={`quiz-${radioName}-${item.id}`}
                    value={option.id}
                    checked={selected}
                    disabled={submitted}
                    onChange={() => selectAnswer(item.id, option.id)}
                    className="mt-1 size-4 accent-primary"
                  />
                  <span>
                    <span className="block">{option.text}</span>
                    {submitted ? (
                      <span className="mt-1 block text-muted-foreground">
                        {item.explain[option.id]}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-3">
        {submitted ? (
          <>
            <p className="text-sm font-medium" aria-live="polite">
              {en.learn.quizScore}: {score}/{items.length}
            </p>
            <Button type="button" variant="outline" onClick={handleRetry}>
              {en.learn.quizRetry}
            </Button>
          </>
        ) : (
          <Button type="button" disabled={!allAnswered} onClick={handleSubmit}>
            {en.learn.quizSubmit}
          </Button>
        )}
      </div>
    </div>
  );
}
