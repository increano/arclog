-- ARCLOG migration 00008: Learning path content (catalog)
-- Global lesson tree: path → unit → lesson → steps (+ MCQ options).

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_units (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.learning_paths (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  unlock_after_unit_id uuid references public.learning_units (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (path_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.learning_units (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  estimated_minutes integer not null default 5
    check (estimated_minutes > 0),
  xp_reward integer not null default 10 check (xp_reward >= 0),
  is_guest_allowed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (unit_id, slug)
);

create table if not exists public.lesson_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  sort_order integer not null default 0,
  step_type text not null
    check (step_type in ('read', 'mcq', 'scramble')),
  prompt text not null,
  book_code text,
  chapter integer,
  verse_start integer,
  verse_end integer,
  translation_slug text default 'eng-kjv',
  correct_answer text,
  scramble_words text[],
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_step_options (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.lesson_steps (id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

create index if not exists idx_learning_units_path on public.learning_units (path_id, sort_order);
create index if not exists idx_lessons_unit on public.lessons (unit_id, sort_order);
create index if not exists idx_lesson_steps_lesson on public.lesson_steps (lesson_id, sort_order);
create index if not exists idx_lesson_step_options_step on public.lesson_step_options (step_id, sort_order);

comment on table public.learning_paths is 'Top-level Bible learning paths (tree roots).';
comment on table public.lessons is 'Interactive lessons; is_guest_allowed marks soft-wall mini-lessons.';
comment on table public.lesson_steps is 'Lesson interactions: read / mcq / scramble; verse pointers optional.';
