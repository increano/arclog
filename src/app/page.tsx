import Link from "next/link";
import { resolvePassage, listTranslations } from "@/lib/bible/queries";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  // Optimistic UI only — mutations use getUser() on the server.
  const { data: claimsData } = await supabase.auth.getClaims();
  const isAuthed = Boolean(claimsData?.claims?.sub);

  const passage = await resolvePassage("John 3:16", DEFAULT_TRANSLATION_SLUG);
  const translations = await listTranslations();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">ARCLOG</h1>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="underline">
            Home
          </Link>
          {isAuthed ? (
            <Link href="/me" className="underline">
              Me
            </Link>
          ) : (
            <Link href="/login" className="underline">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Bible read (server)</h2>
        <p className="text-sm text-zinc-600">
          {DEFAULT_TRANSLATION_SLUG} · {translations.length} translations loaded
        </p>
        {passage.resolved ? (
          <blockquote className="border-l-2 border-zinc-300 pl-4 text-lg leading-relaxed">
            <p>{passage.text}</p>
            <footer className="mt-2 text-sm text-zinc-500">
              — {passage.display}
            </footer>
          </blockquote>
        ) : (
          <p className="text-red-600">{passage.warning ?? "Failed to resolve"}</p>
        )}
      </section>
    </main>
  );
}
