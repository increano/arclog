"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  confirmEmailAuth,
} from "@/lib/actions/confirm-email";
import type { AuthActionState } from "@/lib/actions/auth";

const initial: AuthActionState = {};

export function ConfirmEmailForm({
  code,
  tokenHash,
  type,
  nextPath,
}: {
  code?: string;
  tokenHash?: string;
  type?: string;
  nextPath: string;
}) {
  const [state, action, pending] = useActionState(confirmEmailAuth, initial);
  const hasToken = Boolean(code || (tokenHash && type));

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass-panel rounded-[32px] p-6 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <Icon name="mark_email_read" filled className="text-3xl text-on-secondary-container" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-on-surface">
            Confirm your email
          </h1>
          <p className="font-medium text-on-surface-variant">
            {hasToken
              ? "Tap the button below to finish confirming your account and continue onboarding."
              : "This confirmation link is missing details. Open the latest email from Arclog."}
          </p>
        </div>

        {state.error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-3 py-3 text-sm font-medium text-error">
            {state.error}
          </p>
        ) : null}

        {hasToken ? (
          <form action={action}>
            {code ? <input type="hidden" name="code" value={code} /> : null}
            {tokenHash ? (
              <input type="hidden" name="token_hash" value={tokenHash} />
            ) : null}
            {type ? <input type="hidden" name="type" value={type} /> : null}
            <input type="hidden" name="next" value={nextPath} />
            <button
              type="submit"
              disabled={pending}
              className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white disabled:opacity-60"
            >
              {pending ? "Confirming…" : "Confirm & continue"}
              <Icon name="arrow_forward" />
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-bold text-white"
          >
            Go to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
