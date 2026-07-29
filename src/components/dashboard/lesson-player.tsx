"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { PrimaryButton } from "@/components/ui/primary-button";
import { ProgressBar } from "@/components/dashboard/ui";
import { completeLesson, submitStepAnswer } from "@/lib/actions/lessons";
import type {
  LessonOptionView,
  LessonStepView,
} from "@/components/onboarding/guest-lesson-player";

type Props = {
  lessonId: string;
  lessonTitle: string;
  xpReward: number;
  steps: LessonStepView[];
  options: LessonOptionView[];
  translations?: string[];
};

export function LessonPlayer({
  lessonId,
  lessonTitle,
  xpReward,
  steps,
  options,
  translations = ["eng-kjv"],
}: Props) {
  const router = useRouter();
  const ordered = useMemo(
    () => [...steps].sort((a, b) => a.sort_order - b.sort_order),
    [steps]
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [activeTranslation, setActiveTranslation] = useState(translations[0]);
  const [pending, startTransition] = useTransition();

  const step = ordered[index];
  const stepOptions = options
    .filter((o) => o.step_id === step?.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const progress = ((index + 1) / Math.max(ordered.length, 1)) * 100;

  if (!step) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <p className="font-medium text-on-surface-variant">No lesson steps found.</p>
      </div>
    );
  }

  function finish() {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("lesson_id", lessonId);
      fd.set("score", String(score));
      await completeLesson({}, fd);
      router.push("/me");
      router.refresh();
    });
  }

  function onContinue() {
    setFeedback(null);
    setAnswer("");
    setPicked([]);
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
    const payload =
      step.step_type === "scramble" && picked.length > 0
        ? picked.join(" ")
        : answer;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("step_id", step.id);
      fd.set("answer", payload);
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

  function toggleScrambleWord(word: string, wordIndex: number) {
    const key = `${word}-${wordIndex}`;
    setPicked((prev) => {
      const next = prev.includes(key)
        ? prev.filter((w) => w !== key)
        : [...prev, key];
      setAnswer(next.map((w) => w.replace(/-\d+$/, "")).join(" "));
      return next;
    });
  }

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col px-margin-mobile pb-32 pt-4 md:px-10 md:pt-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/me"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
          aria-label="Close lesson"
        >
          <Icon name="close" className="text-primary" />
        </Link>
        <p className="text-sm font-bold text-on-surface-variant">
          +{xpReward} XP
        </p>
      </div>

      <ProgressBar
        value={progress}
        label={lessonTitle}
        detail={`${Math.round(progress)}% Complete`}
      />

      {translations.length > 1 ? (
        <div className="mt-6 mb-8 flex w-fit rounded-full border-2 border-outline-variant bg-surface-container-low p-1">
          {translations.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveTranslation(slug)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                activeTranslation === slug
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {slug.replace(/^eng-/, "").toUpperCase()}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 mb-8" />
      )}

      <h1 className="mb-6 text-center text-2xl font-bold text-on-background">
        {step.prompt}
      </h1>

      {step.step_type === "read" && step.verseText ? (
        <div className="relative mb-8 overflow-hidden rounded-3xl border-2 border-outline-variant bg-surface-container-lowest p-6 md:p-8">
          <div className="absolute top-0 left-0 h-full w-2 bg-primary/20" />
          <p className="text-center text-xl italic leading-9 text-on-surface">
            {step.verseText}
          </p>
          <div className="mt-4 flex justify-center">
            <span className="rounded-full bg-primary-container px-4 py-1 text-xs font-bold text-on-primary-container">
              {activeTranslation.replace(/^eng-/, "").toUpperCase()}
            </span>
          </div>
        </div>
      ) : null}

      {step.step_type === "mcq" ? (
        <div className="flex flex-col gap-3">
          {stepOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAnswer(opt.label)}
              className={`rounded-xl border-2 px-4 py-4 text-left font-bold transition-colors ${
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
          <p className="text-center text-sm font-bold tracking-wide text-on-surface-variant uppercase">
            Reconstruct the verse
          </p>
          <div className="flex min-h-[120px] flex-wrap content-start justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container p-4">
            {picked.length === 0 ? (
              <span className="self-center text-sm font-medium text-outline">
                Tap words below
              </span>
            ) : (
              picked.map((key) => (
                <span
                  key={key}
                  className="rounded-xl border-2 border-primary bg-primary-container px-4 py-2 text-sm font-bold text-on-primary-container"
                >
                  {key.replace(/-\d+$/, "")}
                </span>
              ))
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {(step.scramble_words ?? []).map((word, i) => {
              const key = `${word}-${i}`;
              const used = picked.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={used}
                  onClick={() => toggleScrambleWord(word, i)}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-bold transition-colors ${
                    used
                      ? "border-transparent bg-transparent text-transparent"
                      : "border-outline-variant bg-surface hover:bg-surface-container-high"
                  }`}
                >
                  {word}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className="mx-auto block text-sm font-bold text-primary"
            onClick={() => {
              setPicked([]);
              setAnswer("");
            }}
          >
            Clear
          </button>
        </div>
      ) : null}

      {feedback ? (
        <p
          className={`mt-6 flex items-center justify-center gap-2 text-sm font-bold ${
            feedback.startsWith("Correct") ? "text-secondary" : "text-tertiary"
          }`}
        >
          <Icon
            name={feedback.startsWith("Correct") ? "check_circle" : "info"}
            filled
          />
          {feedback}
        </p>
      ) : null}

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-outline-variant bg-surface">
        <div className="mx-auto flex w-full max-w-3xl px-margin-mobile py-4 pb-8 md:px-10 md:pb-4">
          {feedback ? (
            <PrimaryButton showArrow disabled={pending} onClick={onContinue}>
              {index >= ordered.length - 1 ? "Finish" : "Next"}
            </PrimaryButton>
          ) : (
            <PrimaryButton
              showArrow
              disabled={
                pending ||
                (step.step_type !== "read" &&
                  !(answer.trim() || picked.length > 0))
              }
              onClick={onSubmitAnswer}
            >
              {step.step_type === "read" ? "Continue" : "Check Answer"}
            </PrimaryButton>
          )}
        </div>
      </footer>
    </div>
  );
}
