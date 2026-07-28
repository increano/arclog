"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/supabase/env";
import { claimGuestProgress } from "@/lib/actions/onboarding";

export type AuthActionState = {
  error?: string;
  message?: string;
  ok?: boolean;
};

function appOriginFromHeaders(headerStore: Headers): string {
  return (
    headerStore.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeInternalPath(String(formData.get("next") ?? "/me"));

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Confirm session with Auth server before redirecting.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: "Sign-in succeeded but session could not be verified." };
  }

  await claimGuestProgress();
  redirect(next);
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const next = safeInternalPath(
    String(formData.get("next") ?? "/onboarding/translation"),
    "/onboarding/translation"
  );

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const headerStore = await headers();
  const origin = appOriginFromHeaders(headerStore);
  // Click-to-confirm page — stops mail scanners from consuming the one-time code.
  const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName || undefined },
      emailRedirectTo,
    },
  });
  if (error) return { error: error.message };

  // Email confirmation is mandatory — no session until the link is clicked.
  if (!data.session) {
    return {
      ok: true,
      message:
        "Check your email to confirm your account. Open the message and tap “Confirm & continue” — confirmation is required before you can sign in.",
    };
  }

  await claimGuestProgress();
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

/** Google OAuth — enable Google provider in Supabase Auth dashboard. */
export async function signInWithGoogle(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const next = safeInternalPath(String(formData.get("next") ?? "/me"));
  const headerStore = await headers();
  const origin = appOriginFromHeaders(headerStore);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) return { error: error.message };
  if (!data.url) return { error: "Could not start Google sign-in." };

  redirect(data.url);
}

/** Call after email/password auth when guest cookie may exist. */
export async function claimGuestAfterAuth(): Promise<void> {
  await claimGuestProgress();
}

