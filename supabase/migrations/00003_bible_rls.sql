-- ARCLOG migration 00003: Public read access for Bible tables
-- Run after 00002_bible_rpc.sql

grant usage on schema public to anon, authenticated;

grant select on table public.bible_translation to anon, authenticated;
grant select on table public.bible_verse to anon, authenticated;

alter table public.bible_translation enable row level security;
alter table public.bible_verse enable row level security;

drop policy if exists "anon read bible_translation" on public.bible_translation;
create policy "anon read bible_translation"
on public.bible_translation
for select
to anon, authenticated
using (true);

drop policy if exists "anon read bible_verse" on public.bible_verse;
create policy "anon read bible_verse"
on public.bible_verse
for select
to anon, authenticated
using (true);
