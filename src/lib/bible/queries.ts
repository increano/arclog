import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { parseReference } from "./parse-reference";
import {
  canonicalBookNameFromCode,
  logicalBookFromToken,
  testamentForBookCode,
} from "./book-codes";

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

export type LibraryBookRow = {
  code: string;
  title: string;
  testament: "OT" | "NT";
  chapters: number;
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

/** Books available for a translation, with chapter counts from live verses. */
export async function listLibraryBooks(
  translationSlug: string = DEFAULT_TRANSLATION_SLUG
): Promise<LibraryBookRow[]> {
  const translation = await getTranslationBySlug(translationSlug);
  if (!translation) return [];

  const supabase = await createClient();
  const [{ data: rpcBooks, error: rpcError }, { data: chapterRows, error: chapterError }] =
    await Promise.all([
      supabase.rpc("list_bible_books", { p_translation_id: translation.id }),
      supabase
        .from("bible_verse")
        .select("book_code, chapter")
        .eq("translation_id", translation.id)
        .eq("verse", 1),
    ]);
  if (rpcError) throw new Error(rpcError.message);
  if (chapterError) throw new Error(chapterError.message);

  const chaptersByBook = new Map<string, number>();
  for (const row of chapterRows ?? []) {
    const code = String(row.book_code);
    const chapter = Number(row.chapter);
    chaptersByBook.set(code, Math.max(chaptersByBook.get(code) ?? 0, chapter));
  }

  const books: LibraryBookRow[] = (rpcBooks ?? []).map(
    (row: { book_code: string; verse_count?: number }) => {
      const code = String(row.book_code);
      return {
        code,
        title: canonicalBookNameFromCode(code) ?? code,
        testament: testamentForBookCode(code),
        chapters: chaptersByBook.get(code) ?? 1,
      };
    }
  );

  // Keep corpus order from list_bible_books when possible; group OT then NT.
  books.sort((a, b) => {
    if (a.testament !== b.testament) return a.testament === "OT" ? -1 : 1;
    const la = logicalBookFromToken(a.code) ?? a.code;
    const lb = logicalBookFromToken(b.code) ?? b.code;
    return la.localeCompare(lb);
  });
  return books;
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

export type ComparedVerse = {
  verse: number;
  bySlug: Record<string, string>;
};

export type ComparedPassage = {
  reference: string;
  bookCode: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  translations: TranslationRow[];
  verses: ComparedVerse[];
  resolved: boolean;
  warning?: string;
};

/** Side-by-side verse text across multiple translation slugs. */
export async function comparePassage(
  reference: string,
  translationSlugs: string[]
): Promise<ComparedPassage> {
  const uniqueSlugs = [...new Set(translationSlugs.map((s) => s.trim()).filter(Boolean))];
  if (uniqueSlugs.length === 0) {
    return {
      reference,
      bookCode: "",
      chapter: 0,
      translations: [],
      verses: [],
      resolved: false,
      warning: "No translations provided",
    };
  }

  const translations: TranslationRow[] = [];
  for (const slug of uniqueSlugs) {
    const t = await getTranslationBySlug(slug);
    if (t) translations.push(t);
  }
  if (translations.length === 0) {
    return {
      reference,
      bookCode: "",
      chapter: 0,
      translations: [],
      verses: [],
      resolved: false,
      warning: "Unknown translations",
    };
  }

  // Parse against the first slug's format for book codes.
  const primarySlug = translations[0].slug;
  const parsed = parseReference(reference, primarySlug);
  if (!parsed) {
    return {
      reference,
      bookCode: "",
      chapter: 0,
      translations,
      verses: [],
      resolved: false,
      warning: "Unrecognized Bible reference",
    };
  }

  const byVerse = new Map<number, Record<string, string>>();

  for (const t of translations) {
    const perSlug = parseReference(reference, t.slug);
    if (!perSlug) continue;
    const rows = await getChapterVerses(t.slug, perSlug.bookCode, perSlug.chapter);
    let filtered = rows;
    if (perSlug.verseStart != null) {
      const end = perSlug.verseEnd ?? perSlug.verseStart;
      filtered = rows.filter((v) => v.verse >= perSlug.verseStart! && v.verse <= end);
    }
    for (const row of filtered) {
      const bucket = byVerse.get(row.verse) ?? {};
      bucket[t.slug] = row.text.trim();
      byVerse.set(row.verse, bucket);
    }
  }

  const verses: ComparedVerse[] = [...byVerse.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([verse, bySlug]) => ({ verse, bySlug }));

  return {
    reference: parsed.display,
    bookCode: parsed.bookCode,
    chapter: parsed.chapter,
    verseStart: parsed.verseStart,
    verseEnd: parsed.verseEnd,
    translations,
    verses,
    resolved: verses.length > 0,
    warning: verses.length === 0 ? "No matching verses" : undefined,
  };
}

