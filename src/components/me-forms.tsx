"use client";

import { useActionState } from "react";
import {
  createBookmark,
  createNote,
  deleteBookmark,
  markAsRead,
  updatePreferredTranslation,
  type ActionResult,
} from "@/lib/actions/personalization";
import { signOut } from "@/lib/actions/auth";

const initial: ActionResult = {};

export function MeForms({
  translations,
  preferredSlug,
}: {
  translations: Array<{ slug: string; title: string | null }>;
  preferredSlug: string;
}) {
  const [bmState, bmAction, bmPending] = useActionState(createBookmark, initial);
  const [noteState, noteAction, notePending] = useActionState(createNote, initial);
  const [readState, readAction, readPending] = useActionState(markAsRead, initial);
  const [prefState, prefAction, prefPending] = useActionState(
    updatePreferredTranslation,
    initial
  );

  return (
    <div className="flex flex-col gap-8">
      <form action={signOut}>
        <button type="submit" className="text-sm underline">
          Sign out
        </button>
      </form>

      <form action={prefAction} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Preferred translation
          <select
            name="preferred_translation_slug"
            defaultValue={preferredSlug}
            className="rounded border border-zinc-300 px-3 py-2"
          >
            {translations.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title ?? t.slug}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={prefPending}
          className="rounded bg-zinc-900 px-3 py-2 text-sm text-white"
        >
          Save
        </button>
        {prefState.error ? (
          <p className="w-full text-sm text-red-600">{prefState.error}</p>
        ) : null}
        {prefState.ok ? (
          <p className="w-full text-sm text-green-700">Saved.</p>
        ) : null}
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Bookmark</h2>
        <form action={bmAction} className="flex flex-col gap-2 max-w-md">
          <input type="hidden" name="translation_slug" value={preferredSlug} />
          <input
            name="reference"
            placeholder="John 3:16"
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <input
            name="label"
            placeholder="Label (optional)"
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={bmPending}
            className="rounded bg-zinc-900 px-3 py-2 text-sm text-white w-fit"
          >
            {bmPending ? "Saving…" : "Add bookmark"}
          </button>
          {bmState.error ? (
            <p className="text-sm text-red-600">{bmState.error}</p>
          ) : null}
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Note</h2>
        <form action={noteAction} className="flex flex-col gap-2 max-w-md">
          <input type="hidden" name="translation_slug" value={preferredSlug} />
          <input
            name="reference"
            placeholder="John 3:16"
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <textarea
            name="content"
            required
            rows={4}
            placeholder="Your note…"
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={notePending}
            className="rounded bg-zinc-900 px-3 py-2 text-sm text-white w-fit"
          >
            {notePending ? "Saving…" : "Add note"}
          </button>
          {noteState.error ? (
            <p className="text-sm text-red-600">{noteState.error}</p>
          ) : null}
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Mark as read</h2>
        <form action={readAction} className="flex flex-col gap-2 max-w-md">
          <input type="hidden" name="translation_slug" value={preferredSlug} />
          <input
            name="reference"
            placeholder="John 8:34-36"
            required
            className="rounded border border-zinc-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={readPending}
            className="rounded bg-zinc-900 px-3 py-2 text-sm text-white w-fit"
          >
            {readPending ? "Saving…" : "Mark as read"}
          </button>
          {readState.error ? (
            <p className="text-sm text-red-600">{readState.error}</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}

export function DeleteBookmarkButton({ id }: { id: string }) {
  const [state, action, pending] = useActionState(deleteBookmark, initial);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending} className="text-xs underline">
        {pending ? "…" : "Delete"}
      </button>
      {state.error ? <span className="text-xs text-red-600"> {state.error}</span> : null}
    </form>
  );
}
