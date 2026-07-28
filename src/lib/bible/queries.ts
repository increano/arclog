import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { parseReference } from "./parse-reference";

export type TranslationRow = {
  id: string;
  slug: string;
  format: string;
  title: string | null;
  language_code: string | null;
};

export type VerseRow = {
  verse: number;
  text: string;
  book_code: string;
  chapter: number;
};

export async function listTranslations(): Promise<TranslationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_translation")
    .select("id, slug, format, title, language_code")
    .order("slug");
  if (error) throw new Error(error.message);
  return (data ?? []) as TranslationRow[];
}

export async function getTranslationBySlug(
  slug: string
): Promise<TranslationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_translation")
    .select("id, slug, format, title, language_code")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as TranslationRow | null;
}

export async function getChapterVerses(
  slug: string,
  bookCode: string,
  chapter: number
): Promise<VerseRow[]> {
  const translation = await getTranslationBySlug(slug);
  if (!translation) throw new Error(`Unknown translation: ${slug}`);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bible_verse")
    .select("verse, text, book_code, chapter")
    .eq("translation_id", translation.id)
    .eq("book_code", bookCode)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as VerseRow[];
}

export type ResolvedPassage = {
  source: string;
  display: string;
  bookCode: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  text: string | null;
  verseLines: VerseRow[];
  resolved: boolean;
  warning?: string;
};

export async function resolvePassage(
  source: string,
  translationSlug: string = DEFAULT_TRANSLATION_SLUG
): Promise<ResolvedPassage> {
  const parsed = parseReference(source, translationSlug);
  if (!parsed) {
    return {
      source,
      display: source,
      bookCode: "",
      chapter: 0,
      text: null,
      verseLines: [],
      resolved: false,
      warning: "Unrecognized Bible reference",
    };
  }

  const chapterRows = await getChapterVerses(
    translationSlug,
    parsed.bookCode,
    parsed.chapter
  );

  let verseLines = chapterRows;
  if (parsed.verseStart != null) {
    const end = parsed.verseEnd ?? parsed.verseStart;
    verseLines = chapterRows.filter(
      (v) => v.verse >= parsed.verseStart! && v.verse <= end
    );
  }

  if (verseLines.length === 0) {
    return {
      source,
      display: parsed.display,
      bookCode: parsed.bookCode,
      chapter: parsed.chapter,
      verseStart: parsed.verseStart,
      verseEnd: parsed.verseEnd,
      text: null,
      verseLines: [],
      resolved: false,
      warning: "No matching verses for this translation",
    };
  }

  return {
    source,
    display: parsed.display,
    bookCode: parsed.bookCode,
    chapter: parsed.chapter,
    verseStart: parsed.verseStart,
    verseEnd: parsed.verseEnd,
    text: verseLines.map((v) => v.text.trim()).join(" "),
    verseLines,
    resolved: true,
  };
}
