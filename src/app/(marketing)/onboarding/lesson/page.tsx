import { redirect } from "next/navigation";
import { GuestLessonPlayer } from "@/components/onboarding/guest-lesson-player";
import { getOnboardingDraft } from "@/lib/onboarding/draft";
import {
  getGuestAllowedLesson,
  getLessonWithSteps,
} from "@/lib/learning/queries";
import { resolvePassage } from "@/lib/bible/queries";

export default async function OnboardingLessonPage() {
  const draft = await getOnboardingDraft();
  if (!draft.learningWhy) redirect("/onboarding/why");
  if (!draft.dailyGoalMinutes) redirect("/onboarding/goal");

  const lesson = await getGuestAllowedLesson();
  if (!lesson) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">No guest lesson available</h1>
        <p className="mt-2 text-on-surface-variant">
          Seed the starter path migration, then refresh.
        </p>
      </main>
    );
  }

  const packed = await getLessonWithSteps(lesson.id);
  if (!packed) redirect("/onboarding/goal");

  const steps = await Promise.all(
    packed.steps.map(async (s) => {
      let verseText: string | null = null;
      if (s.book_code && s.chapter != null && s.verse_start != null) {
        const ref =
          s.verse_end && s.verse_end !== s.verse_start
            ? `${s.book_code} ${s.chapter}:${s.verse_start}-${s.verse_end}`
            : `${s.book_code} ${s.chapter}:${s.verse_start}`;
        // Prefer human reference for eng-kjv seed (John)
        const displayRef =
          s.book_code === "JOHN"
            ? `John ${s.chapter}:${s.verse_start}${
                s.verse_end && s.verse_end !== s.verse_start
                  ? `-${s.verse_end}`
                  : ""
              }`
            : ref;
        const passage = await resolvePassage(
          displayRef,
          s.translation_slug ?? "eng-kjv"
        );
        verseText = passage.resolved ? passage.text : null;
      }
      return {
        id: s.id,
        sort_order: s.sort_order,
        step_type: s.step_type,
        prompt: s.prompt,
        scramble_words: s.scramble_words,
        verseText,
      };
    })
  );

  return (
    <GuestLessonPlayer
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      xpReward={lesson.xp_reward}
      steps={steps}
      options={packed.options}
    />
  );
}
