import "server-only";

import { cookies } from "next/headers";

export const ONBOARDING_COOKIE = "arclog_onboarding";

export type OnboardingDraft = {
  learningWhy?: "personal_growth" | "academic_study" | "daily_devotion" | "other";
  dailyGoalMinutes?: 5 | 10 | 20;
  lessonComplete?: boolean;
  preferredTranslationSlug?: string;
};

export async function getOnboardingDraft(): Promise<OnboardingDraft> {
  const jar = await cookies();
  const raw = jar.get(ONBOARDING_COOKIE)?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return {};
  }
}

export async function setOnboardingDraft(
  patch: Partial<OnboardingDraft>
): Promise<OnboardingDraft> {
  const jar = await cookies();
  const current = await getOnboardingDraft();
  const next = { ...current, ...patch };
  jar.set(ONBOARDING_COOKIE, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return next;
}

export async function clearOnboardingDraft(): Promise<void> {
  const jar = await cookies();
  jar.delete(ONBOARDING_COOKIE);
}

/** Next onboarding URL from draft progress, or null if none / finished as guest. */
export function getOnboardingResumePath(
  draft: OnboardingDraft,
  opts?: { isAuthed?: boolean }
): string | null {
  const started = Boolean(
    draft.learningWhy ||
      draft.dailyGoalMinutes ||
      draft.lessonComplete ||
      draft.preferredTranslationSlug
  );
  if (!started) return null;

  if (draft.preferredTranslationSlug) {
    return opts?.isAuthed ? "/me" : null;
  }
  if (!draft.learningWhy) return "/onboarding/why";
  if (!draft.dailyGoalMinutes) return "/onboarding/goal";
  if (!draft.lessonComplete) return "/onboarding/lesson";
  return opts?.isAuthed ? "/onboarding/translation" : "/onboarding/save";
}
