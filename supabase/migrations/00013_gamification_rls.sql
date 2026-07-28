-- ARCLOG migration 00013: RLS for gamification tables
-- Run after 00007–00012.

-- Profiles: allow limited public read of friend-visible fields via accepted friendships
-- (existing select-own policy remains; add friend read for social).
drop policy if exists "profiles select friends" on public.profiles;
create policy "profiles select friends"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = profiles.id)
        or (f.addressee_id = auth.uid() and f.requester_id = profiles.id)
      )
  )
);

-- Learning catalog: published content is readable by everyone (incl. guests via anon).
alter table public.learning_paths enable row level security;
alter table public.learning_units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_steps enable row level security;
alter table public.lesson_step_options enable row level security;

drop policy if exists "learning_paths public read" on public.learning_paths;
create policy "learning_paths public read"
on public.learning_paths for select to anon, authenticated
using (is_published = true);

drop policy if exists "learning_units public read" on public.learning_units;
create policy "learning_units public read"
on public.learning_units for select to anon, authenticated
using (
  exists (
    select 1 from public.learning_paths p
    where p.id = learning_units.path_id and p.is_published = true
  )
);

drop policy if exists "lessons public read" on public.lessons;
create policy "lessons public read"
on public.lessons for select to anon, authenticated
using (
  exists (
    select 1
    from public.learning_units u
    join public.learning_paths p on p.id = u.path_id
    where u.id = lessons.unit_id and p.is_published = true
  )
);

drop policy if exists "lesson_steps public read" on public.lesson_steps;
create policy "lesson_steps public read"
on public.lesson_steps for select to anon, authenticated
using (
  exists (
    select 1
    from public.lessons l
    join public.learning_units u on u.id = l.unit_id
    join public.learning_paths p on p.id = u.path_id
    where l.id = lesson_steps.lesson_id and p.is_published = true
  )
);

-- Hide which MCQ option is correct from clients; grade server-side via RPC or
-- service patterns. Public read of labels only — is_correct still exposed to
-- authenticated for simplicity; app should grade via submit_step_answer RPC.
drop policy if exists "lesson_step_options public read" on public.lesson_step_options;
create policy "lesson_step_options public read"
on public.lesson_step_options for select to anon, authenticated
using (
  exists (
    select 1
    from public.lesson_steps s
    join public.lessons l on l.id = s.lesson_id
    join public.learning_units u on u.id = l.unit_id
    join public.learning_paths p on p.id = u.path_id
    where s.id = lesson_step_options.step_id and p.is_published = true
  )
);

-- User progress
alter table public.user_lesson_progress enable row level security;
alter table public.user_step_attempts enable row level security;
alter table public.mastered_verses enable row level security;

drop policy if exists "user_lesson_progress own" on public.user_lesson_progress;
create policy "user_lesson_progress own"
on public.user_lesson_progress for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_step_attempts own" on public.user_step_attempts;
create policy "user_step_attempts own"
on public.user_step_attempts for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "mastered_verses own" on public.mastered_verses;
create policy "mastered_verses own"
on public.mastered_verses for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Guest progress: open to anon/authenticated with guest_id in payload.
-- Clients must only write their own guest_id (enforced in app + claim RPC).
alter table public.guest_lesson_progress enable row level security;
alter table public.guest_step_attempts enable row level security;

drop policy if exists "guest_lesson_progress write" on public.guest_lesson_progress;
create policy "guest_lesson_progress write"
on public.guest_lesson_progress for all to anon, authenticated
using (true)
with check (true);

drop policy if exists "guest_step_attempts write" on public.guest_step_attempts;
create policy "guest_step_attempts write"
on public.guest_step_attempts for all to anon, authenticated
using (true)
with check (true);

-- Streaks / stats / unlocks
alter table public.user_streaks enable row level security;
alter table public.user_stats enable row level security;
alter table public.user_path_unlocks enable row level security;

drop policy if exists "user_streaks select own or friends" on public.user_streaks;
create policy "user_streaks select own or friends"
on public.user_streaks for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = user_streaks.user_id)
        or (f.addressee_id = auth.uid() and f.requester_id = user_streaks.user_id)
      )
  )
);

drop policy if exists "user_streaks update own" on public.user_streaks;
create policy "user_streaks update own"
on public.user_streaks for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_streaks insert own" on public.user_streaks;
create policy "user_streaks insert own"
on public.user_streaks for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_stats select own or friends" on public.user_stats;
create policy "user_stats select own or friends"
on public.user_stats for select to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.addressee_id = user_stats.user_id)
        or (f.addressee_id = auth.uid() and f.requester_id = user_stats.user_id)
      )
  )
);

drop policy if exists "user_stats update own" on public.user_stats;
create policy "user_stats update own"
on public.user_stats for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "user_stats insert own" on public.user_stats;
create policy "user_stats insert own"
on public.user_stats for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "user_path_unlocks own" on public.user_path_unlocks;
create policy "user_path_unlocks own"
on public.user_path_unlocks for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Achievements
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

drop policy if exists "achievements public read" on public.achievements;
create policy "achievements public read"
on public.achievements for select to anon, authenticated
using (true);

drop policy if exists "user_achievements own" on public.user_achievements;
create policy "user_achievements own"
on public.user_achievements for select to authenticated
using (user_id = auth.uid());

drop policy if exists "user_achievements insert own" on public.user_achievements;
create policy "user_achievements insert own"
on public.user_achievements for insert to authenticated
with check (user_id = auth.uid());

-- Social
alter table public.friendships enable row level security;
alter table public.leagues enable row level security;
alter table public.league_members enable row level security;
alter table public.challenges enable row level security;

drop policy if exists "friendships participant" on public.friendships;
create policy "friendships select participant"
on public.friendships for select to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships insert requester"
on public.friendships for insert to authenticated
with check (requester_id = auth.uid());

create policy "friendships update participant"
on public.friendships for update to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid())
with check (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "friendships delete participant"
on public.friendships for delete to authenticated
using (requester_id = auth.uid() or addressee_id = auth.uid());

drop policy if exists "leagues public read" on public.leagues;
create policy "leagues public read"
on public.leagues for select to authenticated
using (true);

drop policy if exists "league_members read" on public.league_members;
create policy "league_members read"
on public.league_members for select to authenticated
using (true);

drop policy if exists "league_members join self" on public.league_members;
create policy "league_members join self"
on public.league_members for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "league_members update self" on public.league_members;
create policy "league_members update self"
on public.league_members for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "challenges participant" on public.challenges;
create policy "challenges participant"
on public.challenges for all to authenticated
using (challenger_id = auth.uid() or opponent_id = auth.uid())
with check (challenger_id = auth.uid() or opponent_id = auth.uid());

-- Grants
grant select on table public.learning_paths to anon, authenticated;
grant select on table public.learning_units to anon, authenticated;
grant select on table public.lessons to anon, authenticated;
grant select on table public.lesson_steps to anon, authenticated;
grant select on table public.lesson_step_options to anon, authenticated;

grant select, insert, update, delete on table public.user_lesson_progress to authenticated;
grant select, insert, delete on table public.user_step_attempts to authenticated;
grant select, insert, update, delete on table public.mastered_verses to authenticated;

grant select, insert, update, delete on table public.guest_lesson_progress to anon, authenticated;
grant select, insert, delete on table public.guest_step_attempts to anon, authenticated;

grant select, insert, update on table public.user_streaks to authenticated;
grant select, insert, update on table public.user_stats to authenticated;
grant select, insert, delete on table public.user_path_unlocks to authenticated;

grant select on table public.achievements to anon, authenticated;
grant select, insert on table public.user_achievements to authenticated;

grant select, insert, update, delete on table public.friendships to authenticated;
grant select on table public.leagues to authenticated;
grant select, insert, update on table public.league_members to authenticated;
grant select, insert, update, delete on table public.challenges to authenticated;

-- Grade a step without trusting client is_correct.
create or replace function public.submit_step_answer (
  p_step_id uuid,
  p_answer text,
  p_guest_id uuid default null
)
returns table (is_correct boolean, correct_answer text)
language plpgsql
security definer
set search_path = public
as $$
declare
  step record;
  ok boolean := false;
  uid uuid := auth.uid();
begin
  select * into step from public.lesson_steps where id = p_step_id;
  if not found then
    raise exception 'Step not found';
  end if;

  if step.step_type = 'read' then
    ok := true;
  elsif step.step_type = 'mcq' then
    select exists (
      select 1 from public.lesson_step_options o
      where o.step_id = p_step_id
        and o.is_correct = true
        and lower(trim(o.label)) = lower(trim(coalesce(p_answer, '')))
    ) into ok;
  elsif step.step_type = 'scramble' then
    ok := lower(trim(coalesce(p_answer, ''))) = lower(trim(coalesce(step.correct_answer, '')));
  end if;

  if uid is not null then
    insert into public.user_step_attempts (user_id, step_id, is_correct, answer)
    values (uid, p_step_id, ok, p_answer);
  elsif p_guest_id is not null then
    insert into public.guest_step_attempts (guest_id, step_id, is_correct, answer)
    values (p_guest_id, p_step_id, ok, p_answer);
  else
    raise exception 'Provide auth session or guest_id';
  end if;

  return query select ok, step.correct_answer;
end;
$$;

grant execute on function public.submit_step_answer (uuid, text, uuid) to anon, authenticated;
