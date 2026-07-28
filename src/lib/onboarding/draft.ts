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
