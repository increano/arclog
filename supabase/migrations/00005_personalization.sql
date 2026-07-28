-- ARCLOG migration 00005: Bookmarks, notes, reading progress
-- Run after 00004_profiles.sql

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  reference text,
  book_code text,
  chapter integer,
  verse integer,
  verse_end integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_bookmarks_user_created
  on public.bookmarks (user_id, created_at desc);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  reference text,
  book_code text,
  chapter integer,
  verse integer,
  verse_end integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_user_created
  on public.notes (user_id, created_at desc);

create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz not null default now(),
  reference text,
  book_code text,
  chapter integer,
  verse integer,
  verse_end integer,
  translation_slug text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reading_progress_user_last_read
  on public.reading_progress (user_id, last_read_at desc);

comment on table public.bookmarks is 'User-saved Bible references.';
comment on table public.notes is 'User notes; content may embed a reference prefix.';
comment on table public.reading_progress is 'Append-only reading events; latest last_read_at is the resume pointer.';

drop trigger if exists bookmarks_set_updated_at on public.bookmarks;
create trigger bookmarks_set_updated_at
before update on public.bookmarks
for each row
execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

-- Convenience view: latest reading pointer per user.
create or replace view public.latest_reading_progress
with (security_invoker = true)
as
select distinct on (rp.user_id)
  rp.*
from public.reading_progress rp
order by rp.user_id, rp.last_read_at desc, rp.created_at desc;

grant select on public.latest_reading_progress to authenticated;
