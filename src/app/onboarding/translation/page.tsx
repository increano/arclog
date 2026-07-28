import { redirect } from "next/navigation";
import { TranslationForm } from "@/components/onboarding/translation-form";
import { listTranslations } from "@/lib/bible/queries";
import { getOnboardingDraft } from "@/lib/onboarding/draft";
import { requireUserOrRedirect } from "@/lib/supabase/auth";

export default async function TranslationPage() {
  await requireUserOrRedirect("/onboarding/translation");
  const draft = await getOnboardingDraft();
  if (!draft.learningWhy || !draft.dailyGoalMinutes) {
    // Signed in without draft — send to why to collect prefs
    if (!draft.learningWhy) redirect("/onboarding/why");
    redirect("/onboarding/goal");
  }

  const translations = await listTranslations();
  return (
    <TranslationForm
      translations={translations.map((t) => ({
        slug: t.slug,
        title: t.title,
      }))}
      initialSlug={draft.preferredTranslationSlug ?? "eng-kjv"}
    />
  );
}
