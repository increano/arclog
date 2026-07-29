import { WhyForm } from "@/components/onboarding/why-form";
import { getOnboardingDraft } from "@/lib/onboarding/draft";

export default async function WhyPage() {
  const draft = await getOnboardingDraft();
  return <WhyForm initialWhy={draft.learningWhy} />;
}
