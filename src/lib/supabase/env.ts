export function getSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return value.replace(/\/$/, "");
}

/** Public anon/publishable key — safe for SSR cookie clients, never use service role here. */
export function getSupabaseAnonKey(): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)"
    );
  }
  return value;
}

export const DEFAULT_TRANSLATION_SLUG = "eng-kjv";

/** Prevent open redirects after sign-in. */
export function safeInternalPath(path: string, fallback = "/me"): string {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }
  return path;
}
