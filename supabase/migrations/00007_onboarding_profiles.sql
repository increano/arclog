-- ARCLOG migration 00007: Onboarding fields on profiles
-- Extends Faithfull-style profiles for BibleQuest onboarding.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists learning_why text
    check (learning_why is null or learning_why in (
      'personal_growth', 'academic_study', 'daily_devotion', 'other'
    )),
  add column if not exists daily_goal_minutes integer
    check (daily_goal_minutes is null or daily_goal_minutes in (5, 10, 20)),
  add column if not exists timezone text not null default 'UTC',
  add column if not exists onboarding_completed_at timestamptz;

comment on column public.profiles.learning_why is 'Onboarding: why the user is learning.';
comment on column public.profiles.daily_goal_minutes is 'Onboarding: daily goal in minutes (5/10/20).';
comment on column public.profiles.onboarding_completed_at is 'Set when onboarding flow finishes.';

-- Enrich signup trigger with Google metadata when present.
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    display_name,
    google_profile_id,
    google_image_url,
    profile_picture_url
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'given_name'),
    coalesce(new.raw_user_meta_data ->> 'last_name', new.raw_user_meta_data ->> 'family_name'),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'first_name'
    ),
    new.raw_user_meta_data ->> 'sub',
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set
    google_image_url = coalesce(excluded.google_image_url, public.profiles.google_image_url),
    profile_picture_url = coalesce(excluded.profile_picture_url, public.profiles.profile_picture_url),
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;
