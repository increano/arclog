import { notFound } from "next/navigation";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { getLessonWithSteps } from "@/lib/learning/queries";
import { resolvePassage } from "@/lib/bible/queries";
import { LessonPlayer } from "@/components/dashboard/lesson-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  await requireUserOrRedirect("/me/lessons");
  const { lessonId } = await params;
  const packed = await getLessonWithSteps(lessonId);
  if (!packed) notFound();

  const steps = await Promise.all(
    packed.steps.map(async (s) => {
      let verseText: string | null = null;
      if (s.book_code && s.chapter != null && s.verse_start != null) {
        const displayRef =
          s.book_code === "JOHN"
            ? `John ${s.chapter}:${s.verse_start}${
                s.verse_end && s.verse_end !== s.verse_start
                  ? `-${s.verse_end}`
                  : ""
              }`
            : `${s.book_code} ${s.chapter}:${s.verse_start}`;
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

  const translationSlugs = [
    ...new Set(
      packed.steps
        .map((s) => s.translation_slug)
        .filter((s): s is string => Boolean(s))
    ),
  ];

  return (
    <LessonPlayer
      lessonId={packed.lesson.id}
      lessonTitle={packed.lesson.title}
      xpReward={packed.lesson.xp_reward}
      steps={steps}
      options={packed.options}
      translations={translationSlugs.length ? translationSlugs : ["eng-kjv"]}
    />
  );
}
