-- ARCLOG migration 00011: Achievements + unlocks

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  icon_key text,
  criteria_type text not null
    check (criteria_type in (
      'lessons_completed',
      'streak_days',
      'xp_total',
      'mastered_verses',
      'first_lesson'
    )),
  criteria_value integer not null default 1 check (criteria_value > 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id uuid not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index if not exists idx_user_achievements_user on public.user_achievements (user_id);

insert into public.achievements (slug, title, description, icon_key, criteria_type, criteria_value, sort_order)
values
  ('first-steps', 'First Steps', 'Complete your first lesson.', 'badge-first', 'first_lesson', 1, 1),
  ('streak-3', 'On Fire', 'Maintain a 3-day streak.', 'badge-streak', 'streak_days', 3, 2),
  ('streak-7', 'Week Warrior', 'Maintain a 7-day streak.', 'badge-streak-7', 'streak_days', 7, 3),
  ('xp-100', 'Century', 'Earn 100 XP.', 'badge-xp', 'xp_total', 100, 4),
  ('lessons-5', 'Scholar', 'Complete 5 lessons.', 'badge-lessons', 'lessons_completed', 5, 5),
  ('verses-10', 'Verse Keeper', 'Master 10 verses.', 'badge-verses', 'mastered_verses', 10, 6)
on conflict (slug) do nothing;

-- Evaluate and unlock achievements for the current user.
create or replace function public.evaluate_achievements ()
returns setof public.user_achievements
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  lessons_done integer;
  streak_days integer;
  xp_total integer;
  verses_mastered integer;
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  select count(*) into lessons_done
  from public.user_lesson_progress
  where user_id = uid and status = 'completed';

  select coalesce(current_streak, 0) into streak_days
  from public.user_streaks where user_id = uid;

  select coalesce(xp, 0) into xp_total
  from public.user_stats where user_id = uid;

  select count(*) into verses_mastered
  from public.mastered_verses where user_id = uid;

  update public.user_stats
  set
    lessons_completed = lessons_done,
    bible_iq = least(999, lessons_done * 5 + verses_mastered * 2 + (xp_total / 10)),
    mastery_percent = least(100, (verses_mastered::numeric / greatest(1, lessons_done * 3)) * 100),
    updated_at = now()
  where user_id = uid;

  return query
  insert into public.user_achievements (user_id, achievement_id)
  select uid, a.id
  from public.achievements a
  where not exists (
    select 1 from public.user_achievements ua
    where ua.user_id = uid and ua.achievement_id = a.id
  )
  and (
    (a.criteria_type = 'first_lesson' and lessons_done >= a.criteria_value)
    or (a.criteria_type = 'lessons_completed' and lessons_done >= a.criteria_value)
    or (a.criteria_type = 'streak_days' and streak_days >= a.criteria_value)
    or (a.criteria_type = 'xp_total' and xp_total >= a.criteria_value)
    or (a.criteria_type = 'mastered_verses' and verses_mastered >= a.criteria_value)
  )
  on conflict (user_id, achievement_id) do nothing
  returning *;
end;
$$;

grant execute on function public.evaluate_achievements () to authenticated;
