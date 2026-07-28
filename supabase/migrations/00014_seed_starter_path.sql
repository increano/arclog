-- ARCLOG migration 00014: Seed starter path (guest mini-lesson + John path)

insert into public.learning_paths (slug, title, description, sort_order)
values (
  'gospel-of-john',
  'Gospel of John',
  'Start with the Word made flesh — short interactive lessons.',
  1
)
on conflict (slug) do nothing;

with path as (
  select id from public.learning_paths where slug = 'gospel-of-john'
)
insert into public.learning_units (path_id, slug, title, description, sort_order)
select path.id, 'unit-1-beginnings', 'Beginnings', 'Opening of John and the light.', 1
from path
on conflict (path_id, slug) do nothing;

with unit as (
  select u.id
  from public.learning_units u
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and u.slug = 'unit-1-beginnings'
)
insert into public.lessons (unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed)
select
  unit.id,
  'guest-john-1-1',
  'In the beginning',
  'A short guest-friendly intro to John 1:1.',
  1,
  3,
  15,
  true
from unit
on conflict (unit_id, slug) do nothing;

with lesson as (
  select l.id
  from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john'
    and u.slug = 'unit-1-beginnings'
    and l.slug = 'guest-john-1-1'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read',
  'Read John 1:1 carefully.',
  'JOHN', 1, 1, 1, 'eng-kjv',
  null, null
from lesson
where not exists (
  select 1 from public.lesson_steps s
  where s.lesson_id = lesson.id and s.sort_order = 1
);

with lesson as (
  select l.id
  from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john'
    and u.slug = 'unit-1-beginnings'
    and l.slug = 'guest-john-1-1'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq',
  'Who was with God in the beginning?',
  'JOHN', 1, 1, 1, 'eng-kjv',
  'The Word', null
from lesson
where not exists (
  select 1 from public.lesson_steps s
  where s.lesson_id = lesson.id and s.sort_order = 2
);

with step as (
  select s.id
  from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john'
    and l.slug = 'guest-john-1-1'
    and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('The Word', true, 1),
    ('Moses', false, 2),
    ('An angel', false, 3)
) as v(label, is_correct, sort_order)
where not exists (
  select 1 from public.lesson_step_options o where o.step_id = step.id
);

with lesson as (
  select l.id
  from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john'
    and u.slug = 'unit-1-beginnings'
    and l.slug = 'guest-john-1-1'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble',
  'Unscramble John 1:1 (KJV, first clause).',
  'JOHN', 1, 1, 1, 'eng-kjv',
  'In the beginning was the Word',
  array['Word', 'the', 'was', 'In', 'beginning', 'the']
from lesson
where not exists (
  select 1 from public.lesson_steps s
  where s.lesson_id = lesson.id and s.sort_order = 3
);

-- Second unit locked behind unit 1 (unlock_after set after both exist)
with path as (
  select id from public.learning_paths where slug = 'gospel-of-john'
),
unit1 as (
  select u.id
  from public.learning_units u
  join path on path.id = u.path_id
  where u.slug = 'unit-1-beginnings'
)
insert into public.learning_units (path_id, slug, title, description, sort_order, unlock_after_unit_id)
select path.id, 'unit-2-light', 'The Light', 'Light shining in the darkness.', 2, unit1.id
from path, unit1
on conflict (path_id, slug) do update
set unlock_after_unit_id = excluded.unlock_after_unit_id;

with unit as (
  select u.id
  from public.learning_units u
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and u.slug = 'unit-2-light'
)
insert into public.lessons (unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed)
select unit.id, 'john-1-5', 'Light in the darkness', 'John 1:5 — light vs darkness.', 1, 5, 20, false
from unit
on conflict (unit_id, slug) do nothing;
