import {
  canonicalBookNameFromCode,
  formatForTranslationSlug,
  resolveBookCode,
  resolveBookCodeForSlug,
  type BibleFormat,
} from "./book-codes";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";

export type ParsedReference = {
  bookName: string;
  bookCode: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
  display: string;
};

function normalizeBase(value: string): string {
  return value
    .replace(/[–—]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/[;]+/g, ",")
    .replace(/\uFF1A|\u2236|\uFE55|\uFE13/g, ":")
    .replace(/([A-Za-z])\.(\d)/g, "$1. $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^,+|,+$/g, "")
    .replace(/^([^:]*?)(?<!\d)-(?=\d)/, "$1 ")
    .replace(/:\s+/g, ":")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

function bookTokenToCode(token: string, format: BibleFormat): string | null {
  return resolveBookCode(token, format);
}

/**
 * Parse "John 3:16", "John 8:34-36", or chapter-only "James 1"
 * into a pointer using the translation's book_code family.
 */
export function parseReference(
  ref: string,
  translationSlug: string = DEFAULT_TRANSLATION_SLUG
): ParsedReference | null {
  const format = formatForTranslationSlug(translationSlug);
  if (!format) return null;

  const trimmed = normalizeBase(ref);
  if (!trimmed) return null;

  const withVerses = trimmed.match(
    /^(.*?)\s+(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?$/
  );
  if (withVerses) {
    const bookPart = withVerses[1].trim();
    const bookCode = bookTokenToCode(bookPart, format);
    if (!bookCode) return null;

    const chapter = parseInt(withVerses[2], 10);
    const verseStart = parseInt(withVerses[3], 10);
    const verseEnd = withVerses[4] ? parseInt(withVerses[4], 10) : verseStart;
    if (![chapter, verseStart, verseEnd].every(Number.isFinite)) return null;

    const bookName = canonicalBookNameFromCode(bookCode) ?? bookPart;
    return {
      bookName,
      bookCode,
      chapter,
      verseStart,
      verseEnd,
      display: `${bookName} ${chapter}:${verseStart}${
        verseEnd !== verseStart ? `-${verseEnd}` : ""
      }`,
    };
  }

  const chapterOnly = trimmed.match(/^(.+?)\s+(\d+)$/);
  if (chapterOnly) {
    const bookPart = chapterOnly[1].trim();
    const bookCode = bookTokenToCode(bookPart, format);
    if (!bookCode) return null;
    const chapter = parseInt(chapterOnly[2], 10);
    if (!Number.isFinite(chapter)) return null;
    const bookName = canonicalBookNameFromCode(bookCode) ?? bookPart;
    return {
      bookName,
      bookCode,
      chapter,
      display: `${bookName} ${chapter}`,
    };
  }

  return null;
}

export function canonicalizeReference(
  reference: string,
  translationSlug: string = DEFAULT_TRANSLATION_SLUG
): string {
  const parsed = parseReference(reference, translationSlug);
  return parsed?.display ?? normalizeBase(reference);
}

/** Resolve a free-text book token to the DB book_code for a slug. */
export function bookTokenForSlug(token: string, slug: string): string | null {
  return resolveBookCodeForSlug(token, slug);
}
