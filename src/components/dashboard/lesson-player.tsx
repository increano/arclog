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

/** Initial try + 2 retries, then reveal the answer. */
const MAX_ATTEMPTS = 3;

type StepOutcome = "idle" | "retry" | "correct" | "revealed";

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
  const [attempts, setAttempts] = useState(0);
  const [outcome, setOutcome] = useState<StepOutcome>("idle");
  const [correctAnswer, setCorrectAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [activeTranslation, setActiveTranslation] = useState(translations[0]);
  const [pending, startTransition] = useTransition();

  const step = ordered[index];
  const stepOptions = options
    .filter((o) => o.step_id === step?.id)
    .sort((a, b) => a.sort_order - b.sort_order);
  const progress = ((index + 1) / Math.max(ordered.length, 1)) * 100;
  const locked = outcome === "correct" || outcome === "revealed";
  const retriesLeft = Math.max(0, MAX_ATTEMPTS - attempts);

  if (!step) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <p className="font-medium text-on-surface-variant">No lesson steps found.</p>
      </div>
    );
  }

  function resetStepState() {
    setAnswer("");
    setPicked([]);
    setAttempts(0);
    setOutcome("idle");
    setCorrectAnswer(null);
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
    if (index >= ordered.length - 1) {
      finish();
      return;
    }
    resetStepState();
    setIndex((i) => i + 1);
  }

  function onSubmitAnswer() {
    if (step.step_type === "read") {
      onContinue();
      return;
    }
    if (locked || pending) return;

    // Always send cleaned text (scramble used to join pick keys like "And-0").
    const payload = answer.trim();
    if (!payload) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.set("step_id", step.id);
      fd.set("answer", payload);
      const result = await submitStepAnswer({}, fd);
      if (result.error) {
        setOutcome("retry");
        setCorrectAnswer(null);
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setCorrectAnswer(result.correctAnswer ?? null);

      if (result.isCorrect) {
        setScore((s) => s + 1);
        setOutcome("correct");
        return;
      }

      if (nextAttempts >= MAX_ATTEMPTS) {
        setOutcome("revealed");
        return;
      }

      setOutcome("retry");
    });
  }

  function toggleScrambleWord(word: string, wordIndex: number) {
    if (locked) return;
    const key = `${word}-${wordIndex}`;
    setPicked((prev) => {
      const next = prev.includes(key)
        ? prev.filter((w) => w !== key)
        : [...prev, key];
      setAnswer(next.map((w) => w.replace(/-\d+$/, "")).join(" "));
      return next;
    });
    if (outcome === "retry") setOutcome("idle");
  }

  function selectMcq(label: string) {
    if (locked) return;
    setAnswer(label);
    if (outcome === "retry") setOutcome("idle");
  }

  return (
    <div className="relative mx-auto flex w-full max-w-3xl flex-col px-margin-mobile pb-40 pt-4 md:px-10 md:pt-6">
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
              disabled={locked}
              onClick={() => selectMcq(opt.label)}
              className={`rounded-xl border-2 px-4 py-4 text-left font-bold transition-colors disabled:opacity-70 ${
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
                  disabled={used || locked}
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
          {!locked ? (
            <button
              type="button"
              className="mx-auto block text-sm font-bold text-primary"
              onClick={() => {
                setPicked([]);
                setAnswer("");
                if (outcome === "retry") setOutcome("idle");
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      ) : null}

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-outline-variant bg-surface">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-margin-mobile py-4 pb-8 md:px-10 md:pb-4">
          {outcome === "correct" ? (
            <div className="flex items-start gap-3 rounded-2xl bg-secondary-container px-4 py-3 text-on-secondary-container">
              <Icon name="check_circle" filled className="mt-0.5 shrink-0" />
              <p className="text-sm font-bold">Correct!</p>
            </div>
          ) : null}

          {outcome === "retry" ? (
            <div className="flex items-start gap-3 rounded-2xl bg-tertiary-fixed px-4 py-3 text-on-tertiary-fixed">
              <Icon name="info" filled className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Not quite</p>
                <p className="text-sm font-medium opacity-90">
                  {retriesLeft === 1
                    ? "1 try left, then we’ll show the answer."
                    : `${retriesLeft} tries left.`}
                </p>
              </div>
            </div>
          ) : null}

          {outcome === "revealed" ? (
            <div className="flex items-start gap-3 rounded-2xl border-2 border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface">
              <Icon name="lightbulb" filled className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-bold">Answer</p>
                <p className="mt-1 text-sm font-medium leading-6">
                  {correctAnswer ?? "Keep studying this verse and try again later."}
                </p>
              </div>
            </div>
          ) : null}

          {locked ? (
            <PrimaryButton showArrow disabled={pending} onClick={onContinue}>
              {index >= ordered.length - 1
                ? pending
                  ? "Finishing…"
                  : "Finish"
                : "Next"}
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
              {step.step_type === "read"
                ? "Continue"
                : outcome === "retry"
                  ? "Try again"
                  : "Check Answer"}
            </PrimaryButton>
          )}
        </div>
      </footer>
    </div>
  );
}
