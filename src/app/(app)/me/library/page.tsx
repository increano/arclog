import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { listTranslations, resolvePassage } from "@/lib/bible/queries";
import { VerseLibraryView } from "@/components/dashboard/verse-library";

export default async function LibraryPage() {
  const user = await requireUserOrRedirect("/me/library");
  const supabase = await createClient();

  const [{ data: profile }, { data: bookmarks }, translations] = await Promise.all([
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
    listTranslations(),
  ]);

  const preferred =
    profile?.preferred_translation_slug ?? DEFAULT_TRANSLATION_SLUG;
  const compareSlugs = [
    preferred,
    ...translations.map((t) => t.slug).filter((s) => s !== preferred),
  ].slice(0, 2);

  const reference = "Psalm 23:1";
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
      initialPassage={{
        reference,
        display: "Psalm 23:1",
        bookCode: "PSA",
        chapter: 23,
        verse: 1,
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
