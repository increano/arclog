import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listTranslations } from "@/lib/bible/queries";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { DeleteBookmarkButton, MeForms } from "@/components/me-forms";

export default async function MePage() {
  const user = await requireUserOrRedirect("/me");
  const supabase = await createClient();

  const [{ data: profile }, { data: bookmarks }, { data: notes }, { data: latest }, translations] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, preferred_translation_slug")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("id, label, reference, book_code, chapter, verse, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("notes")
        .select("id, content, reference, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("latest_reading_progress")
        .select("reference, book_code, chapter, verse, translation_slug, last_read_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      listTranslations(),
    ]);

  const preferredSlug =
    profile?.preferred_translation_slug ?? DEFAULT_TRANSLATION_SLUG;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Your space</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {profile?.first_name ? `Hi, ${profile.first_name}.` : "Signed in."}{" "}
          Preferred: {preferredSlug}
        </p>
      </header>

      <MeForms
        translations={translations.map((t) => ({
          slug: t.slug,
          title: t.title,
        }))}
        preferredSlug={preferredSlug}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Bookmarks</h2>
        {(bookmarks ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {(bookmarks ?? []).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2"
              >
                <span>
                  <strong>{b.label}</strong>{" "}
                  <span className="text-zinc-500">
                    {b.reference} ({b.book_code} {b.chapter}
                    {b.verse != null ? `:${b.verse}` : ""})
                  </span>
                </span>
                <DeleteBookmarkButton id={b.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Notes</h2>
        {(notes ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {(notes ?? []).map((n) => (
              <li key={n.id} className="rounded border border-zinc-200 p-3">
                {n.reference ? (
                  <p className="mb-1 text-xs text-zinc-500">{n.reference}</p>
                ) : null}
                <p className="whitespace-pre-wrap">{n.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Latest reading</h2>
        {latest ? (
          <p className="text-sm">
            {latest.reference} · {latest.translation_slug} ·{" "}
            {latest.last_read_at
              ? new Date(latest.last_read_at).toLocaleString()
              : ""}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">No progress yet.</p>
        )}
      </section>
    </main>
  );
}
