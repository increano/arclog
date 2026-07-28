# ARCLOG Supabase migrations

Uses existing Faithfull Bible project **`gcbousxyszxgvmjoktuz`**.

- **URL:** `https://gcbousxyszxgvmjoktuz.supabase.co`
- **SQL Editor:** https://supabase.com/dashboard/project/gcbousxyszxgvmjoktuz/sql/new

Bible tables + RPCs + public read policies are **already applied and seeded** (~242k verses, 9 English translations). Personalization migrations live in this repo.

## Run order

| # | File | Purpose |
|---|------|---------|
| 4 | `migrations/00004_profiles.sql` | `profiles` + signup trigger |
| 5 | `migrations/00005_personalization.sql` | `bookmarks`, `notes`, `reading_progress` |
| 6 | `migrations/00006_personalization_rls.sql` | RLS for user-owned rows |

Copy each file into the SQL Editor and run **in order** (`00004` → `00006`).

## Book codes (important)

`book_code` depends on import format — do **not** assume OSIS-short codes for every slug:

- **OSIS** (`eng-kjv`, `eng-gb-oeb`, `eng-us-oeb`): `JOHN`, `MATT`, `MARK`, `LUKE`, `PS`, `1SAM`, …
- **Zefania / USFX** (`eng-asv`, `eng-darby`, `eng-dra`, `eng-web`, `eng-gb-webbe`, `eng-ylt`): `JHN`, `MAT`, `MRK`, `LUK`, `PSA`, `1SA`, …

Default translation `eng-kjv` → Gospel of John is `JOHN`. Always resolve codes via `list_bible_books(translation_id)` (or a format-aware alias map) before querying verses.

## After migrations

1. **Auth providers** — Dashboard → Authentication → Providers: enable Email (and Google if needed).
2. **App env** — copy `.env.example` → `.env.local` and fill keys from [Project Settings → API](https://supabase.com/dashboard/project/gcbousxyszxgvmjoktuz/settings/api):

```env
NEXT_PUBLIC_SUPABASE_URL=https://gcbousxyszxgvmjoktuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only>
```

Faithfull queried this same DB from the browser via `@supabase/supabase-js` (`bible_translation` / `bible_verse` + `list_bible_books` RPC). ARCLOG should use the same tables.

## Verify

```sql
-- Bible already present
select slug, title from public.bible_translation order by slug limit 10;
select count(*) from public.bible_verse;

-- After 00004–00006
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles', 'bookmarks', 'notes', 'reading_progress')
order by table_name;

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'bookmarks', 'notes', 'reading_progress');
```

## Data model (Faithfull parity)

| Gadget model | Supabase table |
|---|---|
| `user` (profile fields) | `auth.users` + `profiles` |
| `bookmark` | `bookmarks` |
| `note` | `notes` |
| `readingProgress` | `reading_progress` |
| Bible text | `bible_translation` / `bible_verse` *(already seeded)* |

Reading plans (`readingPlan`, `userReadingPlan`) are intentionally **not** migrated — removed in Faithfull.
