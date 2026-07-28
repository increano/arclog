"use client";

import { useMemo, useState, useTransition } from "react";
import { BrandHeader } from "@/components/ui/brand-header";
import { OnboardingProgress } from "@/components/ui/onboarding-progress";
import { PrimaryButton } from "@/components/ui/primary-button";
import { Icon } from "@/components/ui/icon";
import { completeLesson, submitStepAnswer } from "@/lib/actions/lessons";
import { markGuestLessonComplete } from "@/lib/actions/onboarding";

export type LessonStepView = {
  id: string;
  sort_order: number;
  step_type: "read" | "mcq" | "scramble";
  prompt: string;
  scramble_words: string[] | null;
  verseText?: string | null;
};

export type LessonOptionView = {
  id: string;
  step_id: string;
  label: string;
  sort_order: number;
};

type Props = {
  lessonId: string;
  lessonTitle: string;
  xpReward: number;
  steps: LessonStepView[];
  options: LessonOptionView[];
};

export function GuestLessonPlayer({
  lessonId,
  lessonTitle,
  xpReward,
  steps,
  options,
}: Props) {
  const ordered = useMemo(
    () => [...steps].sort((a, b) => a.sort_order - b.sort_order),
    [steps]
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [pending, startTransition] = useTransition();

  const step = ordered[index];
  const stepOptions = options
    .filter((o) => o.step_id === step?.id)
    .sort((a, b) => a.sort_order - b.sort_order);

  if (!step) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>No lesson steps found.</p>
      </div>
    );
  }

  function finish() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("lesson_id", lessonId);
      fd.set("score", String(score));
      await completeLesson({}, fd);
      await markGuestLessonComplete();
    });
  }

  function onContinue() {
    setFeedback(null);
    setAnswer("");
    if (index >= ordered.length - 1) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
  }

  function onSubmitAnswer() {
    if (step.step_type === "read") {
      onContinue();
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("step_id", step.id);
      fd.set("answer", answer);
      const result = await submitStepAnswer({}, fd);
      if (result.error) {
        setFeedback(result.error);
        return;
      }
      if (result.isCorrect) {
        setScore((s) => s + 1);
        setFeedback("Correct!");
      } else {
        setFeedback(
          result.correctAnswer
            ? `Not quite — answer: ${result.correctAnswer}`
            : "Not quite. Keep going!"
        );
      }
    });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <BrandHeader />
      <main className="mx-auto flex w-full max-w-xl flex-grow flex-col px-margin-mobile pb-32 pt-24">
        <OnboardingProgress step={3} label="Try a Lesson" />
        <p className="mb-2 text-sm font-bold tracking-wide text-secondary uppercase">
          {lessonTitle} · +{xpReward} XP
        </p>
        <h1 className="mb-6 text-2xl font-bold text-on-background">
          {step.prompt}
        </h1>

        {step.verseText && step.step_type === "read" ? (
          <blockquote className="mb-6 rounded-2xl bg-surface-container-low p-6 font-[family-name:var(--font-playfair)] text-lg leading-8 text-on-surface">
            {step.verseText}
          </blockquote>
        ) : null}

        {step.step_type === "mcq" ? (
          <div className="flex flex-col gap-3">
            {stepOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAnswer(opt.label)}
                data-active={answer === opt.label}
                className={`option-card rounded-xl border-2 px-4 py-4 text-left font-bold ${
                  answer === opt.label
                    ? "border-primary bg-surface-container"
                    : "border-outline-variant bg-surface-container-lowest"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : null}

        {step.step_type === "scramble" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(step.scramble_words ?? []).map((word, i) => (
                <button
                  key={`${word}-${i}`}
                  type="button"
                  onClick={() =>
                    setAnswer((prev) => (prev ? `${prev} ${word}` : word))
                  }
                  className="rounded-lg border-2 border-outline-variant bg-white px-3 py-2 text-sm font-bold text-primary"
                >
                  {word}
                </button>
              ))}
            </div>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Arrange the words…"
              className="h-14 w-full rounded-xl border-2 border-outline-variant bg-white px-4 font-medium outline-none focus:border-primary"
            />
            <button
              type="button"
              className="text-sm font-bold text-primary"
              onClick={() => setAnswer("")}
            >
              Clear
            </button>
          </div>
        ) : null}

        {step.step_type === "read" ? (
          <p className="text-on-surface-variant">
            Read the verse carefully, then continue.
          </p>
        ) : null}

        {feedback ? (
          <p
            className={`mt-4 flex items-center gap-2 text-sm font-bold ${
              feedback.startsWith("Correct")
                ? "text-secondary"
                : "text-tertiary"
            }`}
          >
            <Icon
              name={feedback.startsWith("Correct") ? "check_circle" : "info"}
              filled
            />
            {feedback}
          </p>
        ) : null}
      </main>

      <footer className="fixed bottom-0 left-0 w-full border-t-2 border-outline-variant bg-surface p-4 pb-8 md:pb-4">
        <div className="mx-auto w-full max-w-md">
          {feedback ? (
            <PrimaryButton showArrow disabled={pending} onClick={onContinue}>
              {index >= ordered.length - 1 ? "Finish" : "Next"}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              showArrow
              disabled={pending || (step.step_type !== "read" && !answer.trim())}
              onClick={onSubmitAnswer}
            >
              {step.step_type === "read" ? "Continue" : "Check"}
            </PrimaryButton>
          )}
        </div>
      </footer>
    </div>
  );
}
