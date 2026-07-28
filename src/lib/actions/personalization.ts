"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { parseReference } from "@/lib/bible/parse-reference";
import {
  formatForTranslationSlug,
  TRANSLATION_FORMAT_BY_SLUG,
} from "@/lib/bible/book-codes";

export type ActionResult = {
  error?: string;
  ok?: boolean;
};

function resolveTranslationSlug(raw: string): string | null {
  const slug = raw.trim() || DEFAULT_TRANSLATION_SLUG;
  if (!formatForTranslationSlug(slug) && !(slug in TRANSLATION_FORMAT_BY_SLUG)) {
    return null;
  }
  return slug;
}

export async function createBookmark(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const reference = String(formData.get("reference") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || reference;
  const slug = resolveTranslationSlug(
    String(formData.get("translation_slug") ?? "")
  );
  if (!slug) return { error: "Unknown translation." };
  if (!reference) return { error: "Reference is required." };
  if (label.length > 200) return { error: "Label is too long." };

  const parsed = parseReference(reference, slug);
  if (!parsed) return { error: `Unrecognized reference: ${reference}` };

  // user_id always from verified session — never from the client.
  const supabase = await createClient();
  const { error } = await supabase.from("bookmarks").insert({
    user_id: auth.userId,
    label,
    reference: parsed.display,
    book_code: parsed.bookCode,
    chapter: parsed.chapter,
    verse: parsed.verseStart ?? null,
    verse_end: parsed.verseEnd ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}

export async function deleteBookmark(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing bookmark id." };

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("bookmarks")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", auth.userId);
  if (error) return { error: error.message };
  if (count === 0) return { error: "Bookmark not found." };

  revalidatePath("/me");
  return { ok: true };
}

export async function createNote(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const content = String(formData.get("content") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const slug = resolveTranslationSlug(
    String(formData.get("translation_slug") ?? "")
  );
  if (!slug) return { error: "Unknown translation." };
  if (!content) return { error: "Note content is required." };
  if (content.length > 10_000) return { error: "Note is too long." };

  const parsed = reference ? parseReference(reference, slug) : null;

  const supabase = await createClient();
  const { error } = await supabase.from("notes").insert({
    user_id: auth.userId,
    content,
    reference: parsed?.display ?? (reference || null),
    book_code: parsed?.bookCode ?? null,
    chapter: parsed?.chapter ?? null,
    verse: parsed?.verseStart ?? null,
    verse_end: parsed?.verseEnd ?? null,
  });
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}

export async function markAsRead(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const reference = String(formData.get("reference") ?? "").trim();
  const slug = resolveTranslationSlug(
    String(formData.get("translation_slug") ?? "")
  );
  if (!slug) return { error: "Unknown translation." };
  if (!reference) return { error: "Reference is required." };

  const parsed = parseReference(reference, slug);
  if (!parsed) return { error: `Unrecognized reference: ${reference}` };

  const supabase = await createClient();
  const { error } = await supabase.from("reading_progress").insert({
    user_id: auth.userId,
    last_read_at: new Date().toISOString(),
    reference: parsed.display,
    book_code: parsed.bookCode,
    chapter: parsed.chapter,
    verse: parsed.verseStart ?? null,
    verse_end: parsed.verseEnd ?? null,
    translation_slug: slug,
  });
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}

export async function updatePreferredTranslation(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireUser();
  if ("error" in auth) return auth;

  const slug = resolveTranslationSlug(
    String(formData.get("preferred_translation_slug") ?? "")
  );
  if (!slug) return { error: "Unknown translation." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ preferred_translation_slug: slug })
    .eq("id", auth.userId);
  if (error) return { error: error.message };

  revalidatePath("/me");
  return { ok: true };
}
