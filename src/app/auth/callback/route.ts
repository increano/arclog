import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  safeInternalPath,
} from "@/lib/supabase/env";

function friendlyAuthError(
  errorCode: string | null,
  description: string | null
): string {
  if (errorCode === "otp_expired") {
    return "That confirmation link is invalid or has expired. Sign up again or request a new email.";
  }
  if (description) {
    return description.replace(/\+/g, " ");
  }
  return "Authentication failed. Try again.";
}

/**
 * Google OAuth returns here with ?code= and is exchanged immediately.
 * Email confirmation should use /auth/confirm (click-to-confirm) to avoid
 * mail-client link prefetch burning the one-time code.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const oauthError = url.searchParams.get("error");
  const errorCode = url.searchParams.get("error_code");
  const errorDescription = url.searchParams.get("error_description");
  const next = safeInternalPath(
    url.searchParams.get("next") ?? "/onboarding/translation"
  );
  const origin = url.origin;

  if (oauthError || errorCode) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", next);
    login.searchParams.set(
      "error",
      friendlyAuthError(errorCode, errorDescription || oauthError)
    );
    return NextResponse.redirect(login);
  }

  if (!code && !(tokenHash && type)) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", next);
    login.searchParams.set("error", "Missing authentication code.");
    return NextResponse.redirect(login);
  }

  const redirectResponse = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  let authError: string | null = null;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = error.message;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) authError = error.message;
  }

  if (authError) {
    const login = new URL("/login", origin);
    login.searchParams.set("next", next);
    login.searchParams.set("error", authError);
    return NextResponse.redirect(login);
  }

  const guestId = request.cookies.get("arclog_guest_id")?.value;
  if (guestId) {
    const { error } = await supabase.rpc("claim_guest_progress", {
      p_guest_id: guestId,
    });
    if (!error) {
      redirectResponse.cookies.delete("arclog_guest_id");
    }
  }

  return redirectResponse;
}
