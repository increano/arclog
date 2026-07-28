# ARCLOG Supabase migrations

Uses existing Faithfull Bible project **`gcbousxyszxgvmjoktuz`**.

- **URL:** `https://gcbousxyszxgvmjoktuz.supabase.co`
- **SQL Editor:** https://supabase.com/dashboard/project/gcbousxyszxgvmjoktuz/sql/new

Bible tables + RPCs + public read policies are **already applied and seeded** (~242k verses, 9 English translations). App + gamification migrations live in this repo.

## Run order

| # | File | Purpose |
|---|------|---------|
| 4 | `migrations/00004_profiles.sql` | `profiles` + signup trigger |
| 5 | `migrations/00005_personalization.sql` | `bookmarks`, `notes`, `reading_progress` (library “saved”) |
| 6 | `migrations/00006_personalization_rls.sql` | RLS for user-owned rows |
| 7 | `migrations/00007_onboarding_profiles.sql` | Onboarding fields on `profiles` |
| 8 | `migrations/00008_learning_content.sql` | Paths → units → lessons → steps |
| 9 | `migrations/00009_learning_progress.sql` | User/guest attempts + `claim_guest_progress` |
| 10 | `migrations/00010_streaks_stats.sql` | Streaks, XP/stats, path unlocks |
| 11 | `migrations/00011_achievements.sql` | Achievements + `evaluate_achievements` |
| 12 | `migrations/00012_social.sql` | Friends, leagues, challenges |
| 13 | `migrations/00013_gamification_rls.sql` | RLS + `submit_step_answer` |
| 14 | `migrations/00014_seed_starter_path.sql` | Gospel of John starter + guest mini-lesson |

Copy each file into the SQL Editor and run **in order** (`00004` → `00014`). Skip `00004`–`00006` if already applied.

## Book codes (important)

`book_code` depends on import format — do **not** assume OSIS-short codes for every slug:

- **OSIS** (`eng-kjv`, `eng-gb-oeb`, `eng-us-oeb`): `JOHN`, `MATT`, `MARK`, `LUKE`, `PS`, `1SAM`, …
- **Zefania / USFX** (`eng-asv`, `eng-darby`, `eng-dra`, `eng-web`, `eng-gb-webbe`, `eng-ylt`): `JHN`, `MAT`, `MRK`, `LUK`, `PSA`, `1SA`, …

Default translation `eng-kjv` → Gospel of John is `JOHN`. Always resolve codes via `list_bible_books(translation_id)` (or a format-aware alias map) before querying verses.

## After migrations

1. **Auth providers** — Dashboard → Authentication → Providers: enable Email + **Google**.
2. **Google redirect** — add `http://localhost:3000/auth/callback` (and production URL) under Auth → URL Configuration → Redirect URLs.
3. **App env** — `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gcbousxyszxgvmjoktuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Verify

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'bookmarks', 'notes', 'reading_progress',
    'learning_paths', 'learning_units', 'lessons', 'lesson_steps',
    'user_lesson_progress', 'guest_lesson_progress', 'mastered_verses',
    'user_streaks', 'user_stats', 'user_path_unlocks',
    'achievements', 'user_achievements',
    'friendships', 'leagues', 'league_members', 'challenges'
  )
order by table_name;

select slug, title from public.learning_paths;
select slug, is_guest_allowed from public.lessons;
```

## Data model

| Concern | Tables / reuse |
|---|---|
| Bible text | `bible_translation` / `bible_verse` *(seeded)* |
| Auth + profile | `auth.users` + `profiles` (extended for onboarding) |
| Library “saved” (not mastery) | `bookmarks`, `notes`, `reading_progress` |
| Lessons | `learning_*`, `lessons`, `lesson_steps`, `*_progress`, `mastered_verses` |
| Streaks / unlocks | `user_streaks`, `user_stats`, `user_path_unlocks` |
| Achievements | `achievements`, `user_achievements` |
| Social | `friendships` → `leagues` / `league_members` → `challenges` |
| Guest soft-wall | `guest_*` + RPC `claim_guest_progress` |
| Grading | RPC `submit_step_answer` |
| Comparison | app helper `comparePassage()` over bible tables |
