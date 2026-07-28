-- ARCLOG migration 00001: Bible content tables
-- Run in Supabase SQL Editor (project: etcmqhaahuhruwklolxj)
-- Safe to re-run: uses IF NOT EXISTS where possible.

create table if not exists public.bible_translation (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  format text not null check (format in ('osis', 'zefania', 'usfx')),
  title text,
  language_code text,
  source_filename text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bible_verse (
  id bigserial primary key,
  translation_id uuid not null references public.bible_translation (id) on delete cascade,
  book_code text not null,
  chapter integer not null,
  verse integer not null,
  text text not null,
  unique (translation_id, book_code, chapter, verse)
);

create index if not exists idx_bible_verse_lookup
  on public.bible_verse (translation_id, book_code, chapter);

create index if not exists idx_bible_verse_book
  on public.bible_verse (book_code, chapter, verse);

comment on table public.bible_translation is 'One row per Bible translation (e.g. eng-kjv).';
comment on table public.bible_verse is 'Verse text; book_code is uppercased OSIS-style (e.g. GEN, 1SA, JHN).';
