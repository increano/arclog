"use client";

import { useActionState, useState } from "react";
import { OnboardingProgress } from "@/components/ui/onboarding-progress";
import { PrimaryButton } from "@/components/ui/primary-button";
import {
  saveTranslationPreference,
  type ActionResult,
} from "@/lib/actions/onboarding";

type Translation = { slug: string; title: string | null };

const initial: ActionResult = {};

export function TranslationForm({
  translations,
  initialSlug = "eng-kjv",
}: {
  translations: Translation[];
  initialSlug?: string;
}) {
  const [slug, setSlug] = useState(initialSlug);
  const [state, action, pending] = useActionState(
    saveTranslationPreference,
    initial
  );

  return (
    <div className="flex flex-grow flex-col bg-background">
      <main className="mx-auto flex w-full max-w-xl flex-grow flex-col items-center px-margin-mobile pb-32 pt-16">
        <OnboardingProgress step={3} total={3} label="Your Bible" />
        <div className="mb-16 text-center">
          <h1 className="mb-3 text-2xl font-bold md:text-3xl">
            Choose your default translation
          </h1>
          <p className="text-on-surface-variant">
            We’ll use this for lessons and scripture. You can change it later.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          {translations.map((t) => (
            <button
              key={t.slug}
              type="button"
              data-active={slug === t.slug}
              onClick={() => setSlug(t.slug)}
              className={`rounded-xl border-2 px-4 py-4 text-left ${
                slug === t.slug
                  ? "border-primary bg-surface-container"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              <p className="font-bold text-on-background">
                {t.title ?? t.slug}
              </p>
              <p className="text-sm text-on-surface-variant">{t.slug}</p>
            </button>
          ))}
        </div>
        {state.error ? (
          <p className="mt-4 text-sm text-error">{state.error}</p>
        ) : null}
      </main>
      <footer className="fixed bottom-0 left-0 w-full border-t-2 border-outline-variant bg-surface p-4 pb-8 md:pb-4">
        <form action={action} className="mx-auto w-full max-w-md">
          <input type="hidden" name="preferred_translation_slug" value={slug} />
          <PrimaryButton type="submit" showArrow disabled={pending}>
            {pending ? "Saving…" : "Finish"}
          </PrimaryButton>
        </form>
      </footer>
    </div>
  );
}
