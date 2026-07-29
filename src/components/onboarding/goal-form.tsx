"use client";

import { useActionState, useState } from "react";
import { OnboardingProgress } from "@/components/ui/onboarding-progress";
import { OptionCardGrid } from "@/components/ui/option-card-grid";
import { PrimaryButton } from "@/components/ui/primary-button";
import { saveGoal, type ActionResult } from "@/lib/actions/onboarding";

/** DB allows 5 / 10 / 20 — map mock labels (Serious 15 → Intense 20). */
const OPTIONS = [
  {
    id: "5",
    title: "Casual",
    subtitle: "5 mins / day",
    icon: "auto_awesome",
  },
  {
    id: "10",
    title: "Regular",
    subtitle: "10 mins / day",
    icon: "local_fire_department",
    filled: true,
  },
  {
    id: "20",
    title: "Intense",
    subtitle: "20 mins / day",
    icon: "rocket_launch",
    filled: true,
  },
];

const initial: ActionResult = {};

export function GoalForm({ initialGoal }: { initialGoal?: number }) {
  const [goal, setGoal] = useState<string | null>(
    initialGoal != null ? String(initialGoal) : "10"
  );
  const [state, action, pending] = useActionState(saveGoal, initial);

  return (
    <div className="relative flex flex-grow flex-col overflow-x-hidden bg-background">
      <main className="mx-auto flex w-full max-w-[1200px] flex-grow flex-col items-center px-margin-mobile pb-32 pt-16">
        <OnboardingProgress step={2} label="Setting the Path" />
        <div className="mb-16 text-center">
          <h1 className="mb-3 text-2xl font-bold text-on-background md:text-3xl">
            What is your daily goal?
          </h1>
          <p className="mx-auto max-w-sm text-on-surface-variant">
            Setting a daily commitment helps you build a lasting habit and grow
            deeper in faith.
          </p>
        </div>
        <OptionCardGrid options={OPTIONS} value={goal} onChange={setGoal} />

        <div className="relative mt-16 max-w-xl overflow-hidden rounded-3xl bg-surface-container-low p-10 text-center">
          <p className="mb-2 font-[family-name:var(--font-playfair)] text-xl font-semibold italic text-on-surface md:text-[22px] md:leading-[34px]">
            &ldquo;Thy word is a lamp unto my feet, and a light unto my
            path.&rdquo;
          </p>
          <p className="text-sm font-bold tracking-widest text-primary uppercase">
            Psalm 119:105
          </p>
        </div>
        {state.error ? (
          <p className="mt-4 text-sm font-medium text-error">{state.error}</p>
        ) : null}
      </main>
      <footer className="fixed bottom-0 left-0 w-full border-t-2 border-outline-variant bg-surface p-4 pb-8 md:pb-4">
        <form action={action} className="mx-auto w-full max-w-md">
          <input type="hidden" name="daily_goal_minutes" value={goal ?? ""} />
          <PrimaryButton type="submit" showArrow disabled={!goal || pending}>
            {pending ? "Saving…" : "Continue"}
          </PrimaryButton>
        </form>
      </footer>
    </div>
  );
}
