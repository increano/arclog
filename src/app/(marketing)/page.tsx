import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import {
  getOnboardingDraft,
  getOnboardingResumePath,
} from "@/lib/onboarding/draft";
import { createClient } from "@/lib/supabase/server";


export default async function WelcomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const isAuthed = Boolean(data.user);

  const draft = await getOnboardingDraft();
  const resumePath = getOnboardingResumePath(draft, { isAuthed });
  if (resumePath) redirect(resumePath);
  if (isAuthed) redirect("/me");

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-grow flex-col items-center justify-center px-margin-mobile pb-12 pt-16">
      <div className="mb-16 max-w-2xl space-y-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-on-background md:text-5xl md:leading-[1.15]">
          Learn the Bible,{" "}
          <br className="hidden md:block" />
          <span className="italic text-primary">One Verse</span> at a Time.
        </h1>
        <p className="px-4 text-base font-medium text-on-surface-variant">
          Join us on an engaging, gamified journey through the scriptures. Build
          a lasting spiritual habit with daily rewards and community streaks.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col items-center space-y-4">
        <Link
          href="/onboarding/why"
          className="group flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-on-primary"
        >
          Get Started
          <Icon
            name="arrow_forward"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/login"
          className="flex w-full items-center justify-center rounded-lg py-3 font-bold text-primary hover:bg-surface-container-low"
        >
          I already have an account
        </Link>
      </div>

      <div className="pointer-events-none fixed top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-secondary-container opacity-10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-tertiary-fixed opacity-10 blur-[120px]" />
    </main>
  );
}
