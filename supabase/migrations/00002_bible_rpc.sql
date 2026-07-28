-- ARCLOG migration 00002: Bible RPC helpers
-- Run after 00001_bible_schema.sql

create or replace function public.translation_verse_counts ()
returns table (
  translation_id uuid,
  verse_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select v.translation_id, count(*)::bigint
  from public.bible_verse v
  group by v.translation_id;
$$;

create or replace function public.list_bible_books (p_translation_id uuid)
returns table (
  book_code text,
  verse_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select b.book_code, count(*)::bigint
  from public.bible_verse b
  where b.translation_id = p_translation_id
  group by b.book_code
  order by b.book_code;
$$;

grant execute on function public.translation_verse_counts () to anon, authenticated, service_role;
grant execute on function public.list_bible_books (uuid) to anon, authenticated, service_role;
