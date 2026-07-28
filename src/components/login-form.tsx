"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  signIn,
  signInWithGoogle,
  type AuthActionState,
} from "@/lib/actions/auth";

const initial: AuthActionState = {};

const GOOGLE_ICON =
  "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initial
  );
  const [googleState, googleAction, googlePending] = useActionState(
    signInWithGoogle,
    initial
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass-panel rounded-[32px] p-6 shadow-xl md:p-10">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-on-surface">
            Welcome back
          </h1>
          <p className="font-medium text-on-surface-variant">
            Sign in to continue your journey as a disciple.
          </p>
        </div>

        <form action={googleAction} className="mb-4">
          <input type="hidden" name="next" value={nextPath} />
          <button
            type="submit"
            disabled={googlePending}
            className="btn-tactile flex h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-outline-variant bg-white hover:bg-surface-container-low disabled:opacity-60"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GOOGLE_ICON} alt="" className="h-6 w-6" />
            <span className="text-sm font-bold">
              {googlePending ? "Redirecting…" : "Continue with Google"}
            </span>
          </button>
          {googleState.error ? (
            <p className="mt-2 text-sm text-error">{googleState.error}</p>
          ) : null}
        </form>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-outline-variant" />
          <span className="text-xs font-medium tracking-widest text-outline uppercase">
            or email
          </span>
          <div className="h-px flex-1 bg-outline-variant" />
        </div>

        <form action={signInAction} className="space-y-3">
          <input type="hidden" name="next" value={nextPath} />
          <div className="relative">
            <Icon
              name="mail"
              className="absolute top-1/2 left-4 -translate-y-1/2 text-outline"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className="h-14 w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest pr-4 pl-12 font-medium outline-none focus:border-primary"
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
              placeholder="Password"
              autoComplete="current-password"
              className="h-14 w-full rounded-xl border-2 border-outline-variant bg-surface-container-lowest pr-4 pl-12 font-medium outline-none focus:border-primary"
            />
          </div>
          {signInState.error ? (
            <p className="text-sm text-error">{signInState.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={signInPending}
            className="btn-primary-tactile flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white disabled:opacity-60"
          >
            {signInPending ? "Signing in…" : "Sign in"}
            <Icon name="arrow_forward" />
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm font-bold">
        New here?{" "}
        <Link href="/onboarding/why" className="text-primary hover:underline">
          Get started
        </Link>
      </p>
    </div>
  );
}
