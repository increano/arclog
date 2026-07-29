import { redirect } from "next/navigation";
import { SaveProgressForm } from "@/components/onboarding/save-progress-form";
import { getOnboardingDraft } from "@/lib/onboarding/draft";
import { getGuestAllowedLesson } from "@/lib/learning/queries";
import { createClient } from "@/lib/supabase/server";

export default async function SaveProgressPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/onboarding/translation");

  const draft = await getOnboardingDraft();
  if (!draft.lessonComplete) redirect("/onboarding/lesson");

  const lesson = await getGuestAllowedLesson();
  return <SaveProgressForm xpEarned={lesson?.xp_reward ?? 15} />;
}
