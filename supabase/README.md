# ARCLOG Supabase migrations

Manual setup for project **`etcmqhaahuhruwklolxj`** (org `snfvmlijhaftrtzcjpet`).

No MCP or Supabase CLI required — copy each file into the [SQL Editor](https://supabase.com/dashboard/project/etcmqhaahuhruwklolxj/sql/new) and run **in order**.

## Run order

| # | File | Purpose |
|---|------|---------|
| 1 | `migrations/00001_bible_schema.sql` | `bible_translation`, `bible_verse` |
| 2 | `migrations/00002_bible_rpc.sql` | `translation_verse_counts()`, `list_bible_books()` |
| 3 | `migrations/00003_bible_rls.sql` | Public read on Bible tables |
| 4 | `migrations/00004_profiles.sql` | `profiles` + signup trigger |
| 5 | `migrations/00005_personalization.sql` | `bookmarks`, `notes`, `reading_progress` |
| 6 | `migrations/00006_personalization_rls.sql` | RLS for user-owned rows |

## After migrations

1. **Seed Bible data** — import your translation XML/CSV into `bible_translation` and `bible_verse` (same process as Faithfull).
2. **Auth providers** — in Dashboard → Authentication → Providers, enable Email and Google if needed.
3. **App env** — create `.env.local` in the Next.js app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://etcmqhaahuhruwklolxj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Project Settings → API>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only, never expose to browser>
```

## Verify

```sql
-- Tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'bible_translation', 'bible_verse', 'profiles',
    'bookmarks', 'notes', 'reading_progress'
  )
order by table_name;

-- RLS enabled on user tables
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
| Bible text | `bible_translation` / `bible_verse` |

Reading plans (`readingPlan`, `userReadingPlan`) are intentionally **not** migrated — removed in Faithfull.
