import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

export type AuthUserResult =
  | { user: User; userId: string }
  | { error: string };

/**
 * Authoritative identity check for mutations/pages.
 * Uses Auth server `getUser()` — do not trust cookie JWT alone for writes.
 */
export async function requireUser(): Promise<AuthUserResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { error: "Not signed in." };
  }
  return { user: data.user, userId: data.user.id };
}

/** Redirect to login when there is no verified session. */
export async function requireUserOrRedirect(next = "/me"): Promise<User> {
  const result = await requireUser();
  if ("error" in result) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return result.user;
}
