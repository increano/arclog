-- ARCLOG migration 00006: Row-level security for user-owned data
-- Run after 00005_personalization.sql

alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notes enable row level security;
alter table public.reading_progress enable row level security;

-- Profiles: users can read and update their own row.
drop policy if exists "profiles select own" on public.profiles;
create policy "profiles select own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Bookmarks
drop policy if exists "bookmarks select own" on public.bookmarks;
create policy "bookmarks select own"
on public.bookmarks
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "bookmarks insert own" on public.bookmarks;
create policy "bookmarks insert own"
on public.bookmarks
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "bookmarks update own" on public.bookmarks;
create policy "bookmarks update own"
on public.bookmarks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "bookmarks delete own" on public.bookmarks;
create policy "bookmarks delete own"
on public.bookmarks
for delete
to authenticated
using (user_id = auth.uid());

-- Notes
drop policy if exists "notes select own" on public.notes;
create policy "notes select own"
on public.notes
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notes insert own" on public.notes;
create policy "notes insert own"
on public.notes
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notes update own" on public.notes;
create policy "notes update own"
on public.notes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notes delete own" on public.notes;
create policy "notes delete own"
on public.notes
for delete
to authenticated
using (user_id = auth.uid());

-- Reading progress
drop policy if exists "reading_progress select own" on public.reading_progress;
create policy "reading_progress select own"
on public.reading_progress
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "reading_progress insert own" on public.reading_progress;
create policy "reading_progress insert own"
on public.reading_progress
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "reading_progress delete own" on public.reading_progress;
create policy "reading_progress delete own"
on public.reading_progress
for delete
to authenticated
using (user_id = auth.uid());

grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.bookmarks to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, delete on table public.reading_progress to authenticated;
