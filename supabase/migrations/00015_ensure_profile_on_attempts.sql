-- ARCLOG migration 00015: Ensure profile before lesson attempts + safer grading RPC
-- Fixes: user_step_attempts_user_id_fkey when auth.users exists without profiles row.

create or replace function public.ensure_user_profile (p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null then
    return;
  end if;

  insert into public.profiles (id)
  values (p_user_id)
  on conflict (id) do nothing;

  insert into public.user_streaks (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  insert into public.user_stats (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;
end;
$$;

grant execute on function public.ensure_user_profile (uuid) to authenticated;

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
    perform public.ensure_user_profile (uid);
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

comment on function public.ensure_user_profile is
  'Creates a minimal profiles (+ streak/stats) row when auth.users exists without one.';
