"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  signInWithGoogle,
  signUp,
  type AuthActionState,
} from "@/lib/actions/auth";

const initial: AuthActionState = {};

const GOOGLE_ICON =
  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

export function SaveProgressForm({ xpEarned = 15 }: { xpEarned?: number }) {
  const [emailMode, setEmailMode] = useState(false);
  const [googleState, googleAction, googlePending] = useActionState(
    signInWithGoogle,
    initial
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initial
  );

  return (
    <div className="flex flex-grow flex-col items-center bg-background text-on-background">
      <main className="flex w-full max-w-[1200px] flex-grow flex-col items-center justify-center gap-10 px-margin-mobile py-8 md:flex-row md:gap-16 md:px-10">
        <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-secondary-container">
            <Icon name="check_circle" filled className="text-5xl text-secondary" />
          </div>
          <h2 className="text-2xl font-bold text-primary md:text-3xl">
            Lesson Complete!
          </h2>
          <div className="mx-auto h-4 w-48 overflow-hidden rounded-full bg-surface-container">
            <div className="h-full w-full rounded-full bg-secondary-container" />
          </div>
          <p className="text-sm font-bold tracking-widest text-secondary uppercase">
            +{xpEarned} XP Earned
          </p>
        </div>

        <div className="w-full max-w-[440px] flex-1">
          <div className="glass-panel relative overflow-hidden rounded-[32px] p-6 shadow-xl md:p-10">
            <div className="mb-10 text-center md:text-left">
              <h1 className="mb-3 text-2xl font-bold text-on-surface md:text-3xl">
                Save Your Progress
              </h1>
              <p className="font-medium text-on-surface-variant">
                Create a profile to sync your streak across devices and compete
                in global leagues.
              </p>
            </div>

            <div className="mb-10 flex flex-col gap-3">
              <form action={googleAction}>
                <input
                  type="hidden"
                  name="next"
                  value="/onboarding/translation"
                />
                <button
                  type="submit"
                  disabled={googlePending}
                  className="btn-tactile flex h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-outline-variant bg-white px-4 hover:bg-surface-container-low disabled:opacity-60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={GOOGLE_ICON} alt="" className="h-6 w-6" />
                  <span className="text-sm font-bold text-on-surface">
                    {googlePending ? "Redirecting…" : "Continue with Google"}
                  </span>
                </button>
              </form>
              {googleState.error ? (
                <p className="text-sm text-error">{googleState.error}</p>
              ) : null}
            </div>

            <div className="mb-10 flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant" />
              <span className="text-xs font-medium tracking-widest text-outline uppercase">
                or use email
              </span>
              <div className="h-px flex-1 bg-outline-variant" />
            </div>

            {!emailMode ? (
              <button
                type="button"
                onClick={() => setEmailMode(true)}
                className="btn-primary-tactile flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white"
              >
                Sign Up with Email
                <Icon name="arrow_forward" />
              </button>
            ) : (
              <form action={signUpAction} className="space-y-3">
                <input type="hidden" name="next" value="/onboarding/translation" />
                <div className="relative">
                  <Icon
                    name="person"
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-outline"
                  />
                  <input
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    className="h-14 w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest pr-4 pl-12 font-medium outline-none focus:border-primary"
                    autoComplete="given-name"
                  />
                </div>
                <div className="relative">
                  <Icon
                    name="mail"
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-outline"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    className="h-14 w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest pr-4 pl-12 font-medium outline-none focus:border-primary"
                    autoComplete="email"
                  />
                </div>
                <div className="relative">
                  <Icon
                    name="lock"
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-outline"
                  />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Password (min 8)"
                    className="h-14 w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest pr-4 pl-12 font-medium outline-none focus:border-primary"
                    autoComplete="new-password"
                  />
                </div>
                {signUpState.error ? (
                  <p className="text-sm text-error">{signUpState.error}</p>
                ) : null}
                {signUpState.message ? (
                  <p className="rounded-xl bg-secondary-container/40 px-3 py-3 text-sm font-medium text-on-secondary-container">
                    {signUpState.message}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={signUpPending || Boolean(signUpState.ok)}
                  className="btn-primary-tactile flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white disabled:opacity-60"
                >
                  {signUpPending
                    ? "Creating…"
                    : signUpState.ok
                      ? "Email sent"
                      : "Create account"}
                  <Icon name="arrow_forward" />
                </button>
              </form>
            )}

            <p className="mt-10 px-4 text-center text-xs font-medium text-on-surface-variant">
              By signing up, you agree to our{" "}
              <span className="font-bold text-primary">Terms of Service</span>{" "}
              and{" "}
              <span className="font-bold text-primary">Privacy Policy</span>.
            </p>
          </div>

          <p className="mt-4 text-center text-sm font-bold text-on-surface">
            Already have an account?{" "}
            <Link
              href="/login?next=/onboarding/translation"
              className="text-primary hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
