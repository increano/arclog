-- ARCLOG migration 00010: Streaks, stats, path unlocks

create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_activity_date date,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  xp integer not null default 0 check (xp >= 0),
  bible_iq integer not null default 0 check (bible_iq >= 0),
  mastery_percent numeric(5, 2) not null default 0
    check (mastery_percent >= 0 and mastery_percent <= 100),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_path_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  unit_id uuid not null references public.learning_units (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, unit_id)
);

create index if not exists idx_user_path_unlocks_user on public.user_path_unlocks (user_id);

-- Auto-create streak/stats rows with profile.
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

  insert into public.user_streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_stats (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Record daily activity and update streak (call from lesson completion).
create or replace function public.record_learning_activity (p_xp integer default 0)
returns public.user_streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (timezone('utc', now()))::date;
  row public.user_streaks;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  values (uid, 1, 1, today)
  on conflict (user_id) do update set
    current_streak = case
      when public.user_streaks.last_activity_date = today then public.user_streaks.current_streak
      when public.user_streaks.last_activity_date = today - 1 then public.user_streaks.current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      public.user_streaks.longest_streak,
      case
        when public.user_streaks.last_activity_date = today then public.user_streaks.current_streak
        when public.user_streaks.last_activity_date = today - 1 then public.user_streaks.current_streak + 1
        else 1
      end
    ),
    last_activity_date = today,
    updated_at = now()
  returning * into row;

  insert into public.user_stats (user_id, xp)
  values (uid, greatest(p_xp, 0))
  on conflict (user_id) do update set
    xp = public.user_stats.xp + greatest(p_xp, 0),
    updated_at = now();

  return row;
end;
$$;

grant execute on function public.record_learning_activity (integer) to authenticated;

-- Backfill for existing profiles.
insert into public.user_streaks (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

insert into public.user_stats (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

comment on table public.user_streaks is 'Daily learning streak per user.';
comment on table public.user_stats is 'Aggregate XP / Bible IQ / mastery for profile + leagues.';
