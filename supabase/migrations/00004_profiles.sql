-- ARCLOG migration 00004: User profiles (extends Supabase Auth)
-- Run after 00003_bible_rls.sql

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  preferred_translation_slug text not null default 'eng-kjv',
  google_profile_id text,
  google_image_url text,
  profile_picture_url text,
  last_signed_in timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_last_signed_in
  on public.profiles (last_signed_in desc nulls last);

comment on table public.profiles is 'App profile for each auth.users row.';

-- Keep updated_at current on profile changes.
create or replace function public.set_updated_at ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Create a profile row when a new user signs up.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, google_image_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
