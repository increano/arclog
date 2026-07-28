import { GoalForm } from "@/components/onboarding/goal-form";
import { getOnboardingDraft } from "@/lib/onboarding/draft";
import { redirect } from "next/navigation";

export default async function GoalPage() {
  const draft = await getOnboardingDraft();
  if (!draft.learningWhy) redirect("/onboarding/why");
  return <GoalForm initialGoal={draft.dailyGoalMinutes} />;
}
