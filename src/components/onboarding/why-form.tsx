"use client";

import { useActionState, useState } from "react";
import { OnboardingProgress } from "@/components/ui/onboarding-progress";
import { OptionCardGrid } from "@/components/ui/option-card-grid";
import { PrimaryButton } from "@/components/ui/primary-button";
import { saveWhy, type ActionResult } from "@/lib/actions/onboarding";

const OPTIONS = [
  {
    id: "personal_growth",
    title: "Personal Growth",
    subtitle: "Grow deeper in faith",
    icon: "spa",
  },
  {
    id: "daily_devotion",
    title: "Daily Devotion",
    subtitle: "Build a daily habit",
    icon: "wb_sunny",
    filled: true,
  },
  {
    id: "academic_study",
    title: "Academic Study",
    subtitle: "Learn with rigor",
    icon: "school",
  },
  {
    id: "other",
    title: "Something Else",
    subtitle: "I have my own reason",
    icon: "edit",
  },
];

const initial: ActionResult = {};

export function WhyForm({ initialWhy }: { initialWhy?: string }) {
  const [why, setWhy] = useState<string | null>(initialWhy ?? null);
  const [state, action, pending] = useActionState(saveWhy, initial);

  return (
    <div className="flex flex-grow flex-col bg-background">
      <main className="mx-auto flex w-full max-w-[1200px] flex-grow flex-col items-center px-margin-mobile pb-32 pt-16">
        <OnboardingProgress step={1} label="Finding Your Why" />
        <div className="mb-16 text-center">
          <h1 className="mb-3 text-2xl font-bold text-on-background md:text-3xl">
            Why are you learning?
          </h1>
          <p className="mx-auto max-w-sm text-on-surface-variant">
            We’ll tune lessons and reminders so they fit your journey.
          </p>
        </div>
        <OptionCardGrid options={OPTIONS} value={why} onChange={setWhy} />
        {state.error ? (
          <p className="mt-4 text-sm font-medium text-error">{state.error}</p>
        ) : null}
      </main>
      <footer className="fixed bottom-0 left-0 w-full border-t-2 border-outline-variant bg-surface p-4 pb-8 md:pb-4">
        <form action={action} className="mx-auto w-full max-w-md">
          <input type="hidden" name="learning_why" value={why ?? ""} />
          <PrimaryButton
            type="submit"
            showArrow
            disabled={!why || pending}
          >
            {pending ? "Saving…" : "Continue"}
          </PrimaryButton>
        </form>
      </footer>
    </div>
  );
}
