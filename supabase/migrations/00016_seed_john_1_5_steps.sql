-- Seed practice steps for catalog lesson john-1-5 (John 1:5).

with lesson as (
  select l.id
  from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john'
    and u.slug = 'unit-2-light'
    and l.slug = 'john-1-5'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read',
  'Read John 1:5 carefully.',
  'JOHN', 1, 5, 5, 'eng-kjv',
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
    and u.slug = 'unit-2-light'
    and l.slug = 'john-1-5'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq',
  'What does the light do in John 1:5?',
  'JOHN', 1, 5, 5, 'eng-kjv',
  'Shineth in darkness', null
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
    and l.slug = 'john-1-5'
    and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('Shineth in darkness', true, 1),
    ('Fades at evening', false, 2),
    ('Waits for the dawn', false, 3)
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
    and u.slug = 'unit-2-light'
    and l.slug = 'john-1-5'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble',
  'Unscramble John 1:5 (KJV, first clause).',
  'JOHN', 1, 5, 5, 'eng-kjv',
  'And the light shineth in darkness',
  array['light', 'the', 'And', 'shineth', 'in', 'darkness']
from lesson
where not exists (
  select 1 from public.lesson_steps s
  where s.lesson_id = lesson.id and s.sort_order = 3
);
