-- ARCLOG migration 00017: Expand Gospel of John path with more lessons + steps.
-- Idempotent: keyed by path/unit/lesson slug; steps use not-exists guards.

-- ── Unit 1: extra lessons (John 1:3, 1:4) ───────────────────────────────────
with unit as (
  select u.id
  from public.learning_units u
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and u.slug = 'unit-1-beginnings'
)
insert into public.lessons (unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed)
select unit.id, v.slug, v.title, v.description, v.sort_order, v.estimated_minutes, v.xp_reward, false
from unit
cross join (
  values
    ('john-1-3', 'All things were made', 'John 1:3 — creation through the Word.', 2, 5, 15),
    ('john-1-4', 'Life and light', 'John 1:4 — life in the Word.', 3, 5, 15)
) as v(slug, title, description, sort_order, estimated_minutes, xp_reward)
on conflict (unit_id, slug) do nothing;

-- ── Unit 2: extra lesson (John 1:9) ─────────────────────────────────────────
with unit as (
  select u.id
  from public.learning_units u
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and u.slug = 'unit-2-light'
)
insert into public.lessons (unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed)
select unit.id, 'john-1-9', 'The true Light', 'John 1:9 — the true Light that lights every man.', 2, 5, 20, false
from unit
on conflict (unit_id, slug) do nothing;

-- ── Unit 3: Witness (after unit 2) ──────────────────────────────────────────
with path as (
  select id from public.learning_paths where slug = 'gospel-of-john'
),
unit2 as (
  select u.id
  from public.learning_units u
  join path on path.id = u.path_id
  where u.slug = 'unit-2-light'
)
insert into public.learning_units (path_id, slug, title, description, sort_order, unlock_after_unit_id)
select path.id, 'unit-3-witness', 'The Witness', 'Belief, children of God, and the Word made flesh.', 3, unit2.id
from path, unit2
on conflict (path_id, slug) do update
set unlock_after_unit_id = excluded.unlock_after_unit_id,
    title = excluded.title,
    description = excluded.description,
    sort_order = excluded.sort_order;

with unit as (
  select u.id
  from public.learning_units u
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and u.slug = 'unit-3-witness'
)
insert into public.lessons (unit_id, slug, title, description, sort_order, estimated_minutes, xp_reward, is_guest_allowed)
select unit.id, v.slug, v.title, v.description, v.sort_order, v.estimated_minutes, v.xp_reward, false
from unit
cross join (
  values
    ('john-1-12', 'Children of God', 'John 1:12 — power to become the sons of God.', 1, 5, 20),
    ('john-1-14', 'Word made flesh', 'John 1:14 — the Word dwelt among us.', 2, 5, 25),
    ('john-3-16', 'God so loved', 'John 3:16 — the heart of the gospel.', 3, 5, 25)
) as v(slug, title, description, sort_order, estimated_minutes, xp_reward)
on conflict (unit_id, slug) do nothing;

-- ── Helper pattern: steps for a lesson (read / mcq / scramble) ───────────────
-- john-1-3
with lesson as (
  select l.id
  from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-3'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 1:3 carefully.',
  'JOHN', 1, 3, 3, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-3'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'According to John 1:3, how many things were made by him?',
  'JOHN', 1, 3, 3, 'eng-kjv', 'All things', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-3' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('All things', true, 1),
    ('Only the heavens', false, 2),
    ('Only mankind', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-3'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 1:3 (KJV, first clause).',
  'JOHN', 1, 3, 3, 'eng-kjv',
  'All things were made by him',
  array['things', 'All', 'were', 'made', 'by', 'him']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);

-- john-1-4
with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-4'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 1:4 carefully.',
  'JOHN', 1, 4, 4, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-4'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'In John 1:4, what was in him?',
  'JOHN', 1, 4, 4, 'eng-kjv', 'Life', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-4' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('Life', true, 1),
    ('Fear', false, 2),
    ('Judgment only', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-4'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 1:4 (KJV).',
  'JOHN', 1, 4, 4, 'eng-kjv',
  'In him was life',
  array['him', 'In', 'was', 'life']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);

-- john-1-9
with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-9'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 1:9 carefully.',
  'JOHN', 1, 9, 9, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-9'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'Who does the true Light light, according to John 1:9?',
  'JOHN', 1, 9, 9, 'eng-kjv', 'Every man', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-9' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('Every man', true, 1),
    ('Only Israel', false, 2),
    ('The angels', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-9'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 1:9 (KJV, opening).',
  'JOHN', 1, 9, 9, 'eng-kjv',
  'That was the true Light',
  array['was', 'That', 'the', 'true', 'Light']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);

-- john-1-12
with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-12'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 1:12 carefully.',
  'JOHN', 1, 12, 12, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-12'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'What power is given to those who receive him (John 1:12)?',
  'JOHN', 1, 12, 12, 'eng-kjv', 'To become the sons of God', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-12' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('To become the sons of God', true, 1),
    ('To rule the nations', false, 2),
    ('To escape all trials', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-12'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 1:12 (KJV, key phrase).',
  'JOHN', 1, 12, 12, 'eng-kjv',
  'to them gave he power',
  array['them', 'to', 'gave', 'he', 'power']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);

-- john-1-14
with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-14'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 1:14 carefully.',
  'JOHN', 1, 14, 14, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-14'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'What did the Word become in John 1:14?',
  'JOHN', 1, 14, 14, 'eng-kjv', 'Flesh', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-14' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('Flesh', true, 1),
    ('Spirit only', false, 2),
    ('A written book', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-1-14'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 1:14 (KJV, first clause).',
  'JOHN', 1, 14, 14, 'eng-kjv',
  'And the Word was made flesh',
  array['Word', 'the', 'And', 'was', 'made', 'flesh']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);

-- john-3-16
with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-3-16'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 1, 'read', 'Read John 3:16 carefully.',
  'JOHN', 3, 16, 16, 'eng-kjv', null, null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 1);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-3-16'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 2, 'mcq', 'What did God give in John 3:16?',
  'JOHN', 3, 16, 16, 'eng-kjv', 'His only begotten Son', null
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 2);

with step as (
  select s.id from public.lesson_steps s
  join public.lessons l on l.id = s.lesson_id
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-3-16' and s.sort_order = 2
)
insert into public.lesson_step_options (step_id, label, is_correct, sort_order)
select step.id, v.label, v.is_correct, v.sort_order
from step
cross join (
  values
    ('His only begotten Son', true, 1),
    ('The law of Moses', false, 2),
    ('A new temple', false, 3)
) as v(label, is_correct, sort_order)
where not exists (select 1 from public.lesson_step_options o where o.step_id = step.id);

with lesson as (
  select l.id from public.lessons l
  join public.learning_units u on u.id = l.unit_id
  join public.learning_paths p on p.id = u.path_id
  where p.slug = 'gospel-of-john' and l.slug = 'john-3-16'
)
insert into public.lesson_steps (
  lesson_id, sort_order, step_type, prompt,
  book_code, chapter, verse_start, verse_end, translation_slug,
  correct_answer, scramble_words
)
select lesson.id, 3, 'scramble', 'Unscramble John 3:16 (KJV, opening).',
  'JOHN', 3, 16, 16, 'eng-kjv',
  'For God so loved the world',
  array['God', 'For', 'so', 'loved', 'the', 'world']
from lesson
where not exists (select 1 from public.lesson_steps s where s.lesson_id = lesson.id and s.sort_order = 3);
