"use client";

import { useActionState } from "react";
import {
  signIn,
  signUp,
  type AuthActionState,
} from "@/lib/actions/auth";

const initial: AuthActionState = {};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initial
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initial
  );

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <form action={signInAction} className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Sign in</h2>
        <input type="hidden" name="next" value={nextPath} />
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-zinc-300 px-3 py-2"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded border border-zinc-300 px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        {signInState.error ? (
          <p className="text-sm text-red-600">{signInState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={signInPending}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {signInPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form action={signUpAction} className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Sign up</h2>
        <label className="flex flex-col gap-1 text-sm">
          First name
          <input
            name="first_name"
            type="text"
            className="rounded border border-zinc-300 px-3 py-2"
            autoComplete="given-name"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded border border-zinc-300 px-3 py-2"
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded border border-zinc-300 px-3 py-2"
            autoComplete="new-password"
          />
        </label>
        {signUpState.error ? (
          <p className="text-sm text-red-600">{signUpState.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={signUpPending}
          className="rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-60"
        >
          {signUpPending ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
