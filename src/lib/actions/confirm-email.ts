"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/supabase/env";
import { claimGuestProgress } from "@/lib/actions/onboarding";
import type { EmailOtpType } from "@supabase/supabase-js";
import type { AuthActionState } from "@/lib/actions/auth";

/**
 * Completes email confirmation after an intentional user click
 * (avoids mail scanners consuming the one-time link).
 */
export async function confirmEmailAuth(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const code = String(formData.get("code") ?? "").trim() || null;
  const tokenHash = String(formData.get("token_hash") ?? "").trim() || null;
  const type = (String(formData.get("type") ?? "").trim() ||
    null) as EmailOtpType | null;
  const next = safeInternalPath(
    String(formData.get("next") ?? "/onboarding/translation"),
    "/onboarding/translation"
  );

  if (!code && !(tokenHash && type)) {
    return { error: "Missing confirmation details. Open the link from your email again." };
  }

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return {
        error:
          error.message.includes("expired") || error.message.includes("invalid")
            ? "That confirmation link is invalid or has expired. Sign up again to get a new email."
            : error.message,
      };
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) {
      return {
        error:
          error.message.includes("expired") || error.message.includes("invalid")
            ? "That confirmation link is invalid or has expired. Sign up again to get a new email."
            : error.message,
      };
    }
  }

  const { data, error: userError } = await supabase.auth.getUser();
  if (userError || !data.user) {
    return { error: "Confirmed, but session could not be verified. Try signing in." };
  }

  await claimGuestProgress();
  redirect(next);
}
