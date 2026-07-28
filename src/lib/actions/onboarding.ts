"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  setOnboardingDraft,
  type OnboardingDraft,
} from "@/lib/onboarding/draft";
import {
  formatForTranslationSlug,
  TRANSLATION_FORMAT_BY_SLUG,
} from "@/lib/bible/book-codes";

export type ActionResult = {
  error?: string;
  ok?: boolean;
};

const LEARNING_WHYS = new Set([
  "personal_growth",
  "academic_study",
  "daily_devotion",
  "other",
]);
const DAILY_GOALS = new Set([5, 10, 20]);

export async function saveWhy(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const why = String(formData.get("learning_why") ?? "").trim();
  if (!LEARNING_WHYS.has(why)) return { error: "Pick a reason to continue." };
  await setOnboardingDraft({
    learningWhy: why as OnboardingDraft["learningWhy"],
  });
  redirect("/onboarding/goal");
}

export async function saveGoal(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const minutes = Number(formData.get("daily_goal_minutes"));
  if (!DAILY_GOALS.has(minutes)) {
    return { error: "Pick a daily goal to continue." };
  }
  await setOnboardingDraft({
    dailyGoalMinutes: minutes as 5 | 10 | 20,
  });
  redirect("/onboarding/lesson");
}

export async function markGuestLessonComplete(): Promise<ActionResult> {
  await setOnboardingDraft({ lessonComplete: true });
  redirect("/onboarding/save");
}

export async function completeOnboarding(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const draft = await getOnboardingDraft();
  const learningWhy =
    String(formData.get("learning_why") ?? "").trim() || draft.learningWhy || "";
  const dailyGoal = Number(
    formData.get("daily_goal_minutes") || draft.dailyGoalMinutes || 0
  );
  const displayName = String(formData.get("display_name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "UTC").trim() || "UTC";
  const translationSlug =
    String(formData.get("preferred_translation_slug") ?? "").trim() ||
    draft.preferredTranslationSlug ||
    "eng-kjv";

  if (!LEARNING_WHYS.has(learningWhy)) {
    return { error: "Invalid learning why." };
  }
  if (!DAILY_GOALS.has(dailyGoal)) {
    return { error: "Daily goal must be 5, 10, or 20 minutes." };
  }
  if (
    !formatForTranslationSlug(translationSlug) &&
    !(translationSlug in TRANSLATION_FORMAT_BY_SLUG)
  ) {
    return { error: "Unknown translation." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      learning_why: learningWhy,
      daily_goal_minutes: dailyGoal,
      display_name: displayName || null,
      timezone,
      preferred_translation_slug: translationSlug,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", auth.userId);
  if (error) return { error: error.message };

  const { data: units } = await supabase
    .from("learning_units")
    .select("id, unlock_after_unit_id");
  const firstUnits = (units ?? []).filter((u) => !u.unlock_after_unit_id);
  if (firstUnits.length > 0) {
    await supabase.from("user_path_unlocks").upsert(
      firstUnits.map((u) => ({
        user_id: auth.userId,
        unit_id: u.id,
      })),
      { onConflict: "user_id,unit_id", ignoreDuplicates: true }
    );
  }

  await clearOnboardingDraft();
  revalidatePath("/me");
  redirect("/me");
}

export async function saveTranslationPreference(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const slug = String(formData.get("preferred_translation_slug") ?? "").trim();
  if (
    !formatForTranslationSlug(slug) &&
    !(slug in TRANSLATION_FORMAT_BY_SLUG)
  ) {
    return { error: "Unknown translation." };
  }

  await setOnboardingDraft({ preferredTranslationSlug: slug });

  const auth = await requireUser();
  if ("error" in auth) {
    redirect("/onboarding/save");
  }

  // Persist draft fields + translation in one shot when already signed in.
  const draft = await getOnboardingDraft();
  const fd = new FormData();
  if (draft.learningWhy) fd.set("learning_why", draft.learningWhy);
  if (draft.dailyGoalMinutes) {
    fd.set("daily_goal_minutes", String(draft.dailyGoalMinutes));
  }
  fd.set("preferred_translation_slug", slug);
  fd.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
  return completeOnboarding({}, fd);
}

/** Merge cookie guest progress after auth. */
export async function claimGuestProgress(): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const { cookies } = await import("next/headers");
  const jar = await cookies();
  const guestId = jar.get("arclog_guest_id")?.value;
  if (!guestId) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_guest_progress", {
    p_guest_id: guestId,
  });
  if (error) return { error: error.message };

  jar.delete("arclog_guest_id");
  revalidatePath("/me");
  return { ok: true };
}
