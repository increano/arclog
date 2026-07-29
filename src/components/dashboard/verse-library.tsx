"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  Chip,
  DashboardCard,
  DashboardPageHeader,
  ScriptureCard,
} from "@/components/dashboard/ui";

export type LibraryBook = {
  code: string;
  title: string;
  testament: "OT" | "NT";
  chapters: number;
};

export type LibraryPassage = {
  reference: string;
  display: string;
  bookCode: string;
  chapter: number;
  verse: number;
  translations: Array<{ slug: string; title: string; text: string }>;
};

const FALLBACK_BOOKS: LibraryBook[] = [
  { code: "GEN", title: "Genesis", testament: "OT", chapters: 50 },
  { code: "PSA", title: "Psalms", testament: "OT", chapters: 150 },
  { code: "PRO", title: "Proverbs", testament: "OT", chapters: 31 },
  { code: "ISA", title: "Isaiah", testament: "OT", chapters: 66 },
  { code: "JOHN", title: "John", testament: "NT", chapters: 21 },
  { code: "ROM", title: "Romans", testament: "NT", chapters: 16 },
];

export function VerseLibraryView({
  books = FALLBACK_BOOKS,
  initialPassage,
  bookmarks,
}: {
  books?: LibraryBook[];
  initialPassage: LibraryPassage;
  bookmarks: Array<{ id: string; label: string; reference: string }>;
}) {
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState(
    books.find((b) => b.code === initialPassage.bookCode) ?? books[0]
  );
  const [selectedChapter, setSelectedChapter] = useState(initialPassage.chapter);
  const [expanded, setExpanded] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) => b.title.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
  }, [books, query]);

  const ot = filtered.filter((b) => b.testament === "OT");
  const nt = filtered.filter((b) => b.testament === "NT");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <aside className="w-full border-b-2 border-outline-variant bg-surface-container-lowest p-margin-mobile lg:w-80 lg:border-b-0 lg:border-r-2 lg:p-6">
        <h1 className="mb-4 text-xl font-bold text-on-surface">Verse Library</h1>
        <div className="relative mb-4">
          <Icon
            name="search"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-outline"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books or verses..."
            className="w-full rounded-full border-2 border-outline-variant bg-surface py-3 pr-4 pl-10 text-sm font-medium outline-none focus:border-primary"
          />
        </div>

        <div className="flex max-h-[50vh] flex-col gap-4 overflow-y-auto lg:max-h-[calc(100vh-12rem)]">
          <BookGroup
            label="Old Testament"
            books={ot}
            selectedBook={selectedBook}
            expanded={expanded}
            selectedChapter={selectedChapter}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setExpanded(true);
              setSelectedChapter(1);
            }}
            onSelectChapter={setSelectedChapter}
          />
          <BookGroup
            label="New Testament"
            books={nt}
            selectedBook={selectedBook}
            expanded={expanded}
            selectedChapter={selectedChapter}
            onSelectBook={(book) => {
              setSelectedBook(book);
              setExpanded(true);
              setSelectedChapter(1);
            }}
            onSelectChapter={setSelectedChapter}
          />
        </div>
      </aside>

      <section className="flex-1 bg-surface-container p-margin-mobile pb-10 lg:p-10">
        <DashboardPageHeader
          title={initialPassage.display}
          subtitle={`${selectedBook.title} · Chapter ${selectedChapter}`}
          action={
            <div className="flex flex-wrap gap-2">
              <Chip tone="tertiary" icon="verified">
                Library
              </Chip>
              <Chip tone="primary">Compare</Chip>
            </div>
          }
        />

        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {initialPassage.translations.map((t, i) => (
            <ScriptureCard
              key={t.slug}
              text={t.text}
              reference={initialPassage.reference}
              translationLabel={t.title || t.slug}
              accent={i === 0 ? "secondary" : "primary"}
            />
          ))}
        </div>

        <DashboardCard className="mb-6 border-dashed">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="bookmark" className="text-primary" />
            <h3 className="text-sm font-bold text-on-surface">Your bookmarks</h3>
          </div>
          {bookmarks.length === 0 ? (
            <p className="text-sm font-medium text-on-surface-variant">
              No bookmarks yet. Save verses as you study.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {bookmarks.slice(0, 6).map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-outline-variant bg-surface p-3"
                >
                  <p className="font-bold text-primary">{b.label}</p>
                  <p className="text-xs text-on-surface-variant">{b.reference}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/me"
            className="btn-primary-tactile inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary"
          >
            <Icon name="home" />
            Back to path
          </Link>
          <Link
            href="/me/lessons"
            className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-outline-variant bg-surface px-5 text-sm font-bold text-primary"
          >
            <Icon name="quiz" />
            Practice a lesson
          </Link>
        </div>
      </section>
    </div>
  );
}

function BookGroup({
  label,
  books,
  selectedBook,
  expanded,
  selectedChapter,
  onSelectBook,
  onSelectChapter,
}: {
  label: string;
  books: LibraryBook[];
  selectedBook: LibraryBook;
  expanded: boolean;
  selectedChapter: number;
  onSelectBook: (book: LibraryBook) => void;
  onSelectChapter: (chapter: number) => void;
}) {
  if (books.length === 0) return null;
  return (
    <div>
      <p className="mb-2 px-2 text-xs font-bold tracking-wider text-primary uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {books.map((book) => {
          const active = book.code === selectedBook.code;
          return (
            <div key={book.code}>
              <button
                type="button"
                onClick={() => onSelectBook(book)}
                className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors ${
                  active
                    ? "border-l-4 border-primary bg-surface-container-highest"
                    : "hover:bg-surface-container-high"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon
                    name="auto_stories"
                    filled={active}
                    className={active ? "text-primary" : "text-tertiary"}
                  />
                  <span className="text-sm font-bold">{book.title}</span>
                </span>
                <Icon
                  name={active && expanded ? "expand_more" : "chevron_right"}
                  className={active ? "text-primary" : "text-outline"}
                />
              </button>
              {active && expanded ? (
                <div className="mt-1 grid grid-cols-4 gap-1 rounded-xl bg-surface-container-low p-2">
                  {Array.from({ length: Math.min(book.chapters, 24) }, (_, i) => i + 1).map(
                    (chapter) => (
                      <button
                        key={chapter}
                        type="button"
                        onClick={() => onSelectChapter(chapter)}
                        className={`aspect-square rounded-lg text-sm font-bold transition-colors ${
                          selectedChapter === chapter
                            ? "bg-primary text-on-primary"
                            : "hover:bg-primary-container hover:text-on-primary-container"
                        }`}
                      >
                        {chapter}
                      </button>
                    )
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
