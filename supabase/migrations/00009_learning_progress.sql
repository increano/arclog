-- ARCLOG migration 00009: Lesson attempts, mastery, guest progress + claim

create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  score integer not null default 0,
  attempts integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.user_step_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  step_id uuid not null references public.lesson_steps (id) on delete cascade,
  is_correct boolean not null,
  answer text,
  created_at timestamptz not null default now()
);

create table if not exists public.mastered_verses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  book_code text not null,
  chapter integer not null,
  verse integer not null,
  translation_slug text not null default 'eng-kjv',
  mastery_score integer not null default 100 check (mastery_score between 0 and 100),
  mastered_at timestamptz not null default now(),
  unique (user_id, book_code, chapter, verse, translation_slug)
);

-- Anonymous soft-wall progress (cookie guest_id).
create table if not exists public.guest_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  score integer not null default 0,
  attempts integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (guest_id, lesson_id)
);

create table if not exists public.guest_step_attempts (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null,
  step_id uuid not null references public.lesson_steps (id) on delete cascade,
  is_correct boolean not null,
  answer text,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_lesson_progress_user on public.user_lesson_progress (user_id);
create index if not exists idx_user_step_attempts_user on public.user_step_attempts (user_id, created_at desc);
create index if not exists idx_mastered_verses_user on public.mastered_verses (user_id);
create index if not exists idx_guest_lesson_progress_guest on public.guest_lesson_progress (guest_id);
create index if not exists idx_guest_step_attempts_guest on public.guest_step_attempts (guest_id);

-- Claim guest rows into the authenticated user (call after signup/sign-in).
create or replace function public.claim_guest_progress (p_guest_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_guest_id is null then
    return;
  end if;

  insert into public.user_lesson_progress (user_id, lesson_id, status, score, attempts, started_at, completed_at)
  select uid, g.lesson_id, g.status, g.score, g.attempts, g.started_at, g.completed_at
  from public.guest_lesson_progress g
  where g.guest_id = p_guest_id
  on conflict (user_id, lesson_id) do update set
    status = case
      when public.user_lesson_progress.status = 'completed' then 'completed'
      else excluded.status
    end,
    score = greatest(public.user_lesson_progress.score, excluded.score),
    attempts = public.user_lesson_progress.attempts + excluded.attempts,
    completed_at = coalesce(public.user_lesson_progress.completed_at, excluded.completed_at);

  insert into public.user_step_attempts (user_id, step_id, is_correct, answer, created_at)
  select uid, g.step_id, g.is_correct, g.answer, g.created_at
  from public.guest_step_attempts g
  where g.guest_id = p_guest_id;

  delete from public.guest_step_attempts where guest_id = p_guest_id;
  delete from public.guest_lesson_progress where guest_id = p_guest_id;
end;
$$;

grant execute on function public.claim_guest_progress (uuid) to authenticated;

comment on function public.claim_guest_progress is 'Merge anonymous lesson progress into auth.uid() after account creation.';
