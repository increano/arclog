/**
 * Map Postgres / Supabase errors to short, user-safe copy.
 * Never surface constraint names, SQL, or table identifiers.
 */
export function toUserFacingError(
  raw: string | null | undefined,
  fallback = "Something went wrong. Please try again."
): string {
  const message = (raw ?? "").trim();
  if (!message) return fallback;

  const lower = message.toLowerCase();

  if (
    lower.includes("foreign key") ||
    lower.includes("violates foreign key") ||
    lower.includes("user_step_attempts_user_id_fkey") ||
    lower.includes("user_lesson_progress_user_id_fkey") ||
    lower.includes("profiles")
  ) {
    return "Your account isn’t fully set up yet. Sign out, sign in again, then retry.";
  }

  if (lower.includes("unique") || lower.includes("duplicate")) {
    return "That already exists. Try something different.";
  }

  if (lower.includes("row-level security") || lower.includes("rls")) {
    return "You don’t have permission to do that. Try signing in again.";
  }

  if (
    lower.includes("jwt") ||
    lower.includes("not authenticated") ||
    lower.includes("invalid claim")
  ) {
    return "Please sign in again to continue.";
  }

  if (lower.includes("network") || lower.includes("fetch failed")) {
    return "Network error. Check your connection and try again.";
  }

  // Already human-written app messages (no SQL noise)
  if (
    !lower.includes("violates") &&
    !lower.includes("constraint") &&
    !lower.includes("relation ") &&
    !lower.includes("column ") &&
    !lower.includes("null value") &&
    !lower.includes("pgrst") &&
    message.length < 160
  ) {
    return message;
  }

  return fallback;
}
