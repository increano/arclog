import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import {
  listLibraryBooks,
  listTranslations,
  resolvePassage,
} from "@/lib/bible/queries";
import { canonicalBookNameFromCode } from "@/lib/bible/book-codes";
import { VerseLibraryView } from "@/components/dashboard/verse-library";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ book?: string; chapter?: string; ref?: string }>;
}) {
  const user = await requireUserOrRedirect("/me/library");
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: profile }, { data: bookmarks }, { data: latest }, translations] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("preferred_translation_slug")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("id, label, reference")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("latest_reading_progress")
        .select("reference, book_code, chapter, verse, translation_slug")
        .eq("user_id", user.id)
        .maybeSingle(),
      listTranslations(),
    ]);

  const preferred =
    profile?.preferred_translation_slug ?? DEFAULT_TRANSLATION_SLUG;
  const books = await listLibraryBooks(preferred);

  const bookmarkRef = (params.ref ?? "").trim();
  const fromBookmark = bookmarkRef
    ? await resolvePassage(bookmarkRef, preferred)
    : null;

  let bookCode = (params.book ?? "").trim().toUpperCase();
  let chapter = Number(params.chapter);
  let verse = 1;

  if (fromBookmark?.resolved) {
    bookCode = fromBookmark.bookCode;
    chapter = fromBookmark.chapter;
    verse = fromBookmark.verseStart ?? 1;
  }

  if (!books.some((b) => b.code === bookCode)) {
    bookCode =
      latest?.book_code ??
      books.find((b) => b.code === "JOHN" || b.code === "JHN")?.code ??
      books[0]?.code ??
      "JOHN";
  }
  const selectedBook = books.find((b) => b.code === bookCode) ?? books[0];
  if (!fromBookmark?.resolved) {
    if (!Number.isFinite(chapter) || chapter < 1) {
      chapter = latest?.book_code === bookCode ? latest.chapter : 1;
    }
    verse =
      latest?.book_code === bookCode && latest.chapter === chapter
        ? latest.verse
        : 1;
  }
  if (selectedBook) {
    chapter = Math.min(Math.max(1, chapter), selectedBook.chapters);
  }

  const bookName =
    selectedBook?.title ?? canonicalBookNameFromCode(bookCode) ?? bookCode;
  const reference = fromBookmark?.resolved
    ? fromBookmark.display
    : `${bookName} ${chapter}:${verse}`;

  const compareSlugs = [
    preferred,
    ...translations.map((t) => t.slug).filter((s) => s !== preferred),
  ].slice(0, 2);

  const passages = await Promise.all(
    compareSlugs.map(async (slug) => {
      const passage = await resolvePassage(reference, slug);
      const translation = translations.find((t) => t.slug === slug);
      return {
        slug,
        title: translation?.title ?? slug,
        text: passage.text ?? "Passage unavailable in this translation.",
      };
    })
  );

  return (
    <VerseLibraryView
      key={`${bookCode}-${chapter}-${verse}`}
      books={books}
      initialPassage={{
        reference,
        display: reference,
        bookCode,
        chapter,
        verse,
        translations: passages,
      }}
      bookmarks={(bookmarks ?? []).map((b) => ({
        id: b.id,
        label: b.label,
        reference: b.reference,
      }))}
    />
  );
}
