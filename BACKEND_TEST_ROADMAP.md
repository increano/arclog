# ARCLOG — Backend Test Roadmap

Step-by-step plan to verify the Supabase backend before building the new frontend.

Bible data already lives on Faithfull project `gcbousxyszxgvmjoktuz`. Run personalization migrations only — see [supabase/README.md](./supabase/README.md).

---

## Phase 0 — Prerequisites

- [ ] Supabase project `gcbousxyszxgvmjoktuz` is accessible
- [ ] Bible tables/RPCs already present (skip `00001`–`00003`)
- [ ] Migrations `00004` → `00006` applied in SQL Editor
- [ ] Auth providers enabled: **Email** (required), **Google** (optional for now)
- [ ] `.env.local` created (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://gcbousxyszxgvmjoktuz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

---

## Phase 1 — Schema smoke test

Run in **SQL Editor**:

```sql
-- 1.1 All tables exist
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'bible_translation', 'bible_verse', 'profiles',
    'bookmarks', 'notes', 'reading_progress'
  )
order by table_name;
-- Expected: 6 rows

-- 1.2 RLS enabled on user tables
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'bookmarks', 'notes', 'reading_progress');
-- Expected: rowsecurity = true for all 4

-- 1.3 RPCs exist
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in ('translation_verse_counts', 'list_bible_books');
-- Expected: 2 rows
```

**Pass:** all checks return expected rows.

---

## Phase 2 — Bible content (public read)

### 2.1 Seed minimal test data

**Skip** — Faithfull project already has ~242k verses (including `eng-kjv`). Only seed if the Bible tables were wiped.

### 2.2 Book codes are format-dependent (verified)

`book_code` values are **not** shared across all translations. Use the code family that matches `bible_translation.format` (or look up via `list_bible_books`).

| Slug | Format | Books | John gospel code | John 3:16 |
|---|---|---:|---|---|
| `eng-asv` | zefania | 66 | `JHN` | OK |
| `eng-darby` | zefania | 66 | `JHN` | OK |
| `eng-dra` | zefania | 75 | `JHN` | OK |
| `eng-gb-webbe` | usfx | 81 | `JHN` | OK |
| `eng-web` | usfx | 84 | `JHN` | OK |
| `eng-ylt` | zefania | 27 (NT) | `JHN` | OK |
| `eng-kjv` | osis | 81 | `JOHN` | OK |
| `eng-gb-oeb` | osis | 42 (NT) | `JOHN` | OK |
| `eng-us-oeb` | osis | 42 (NT) | `JOHN` | OK |

Other common splits (same idea):

| Concept | OSIS (`eng-kjv`, OEB) | Zefania / USFX |
|---|---|---|
| Matthew | `MATT` | `MAT` |
| Mark | `MARK` | `MRK` |
| Luke | `LUKE` | `LUK` |
| Psalms | `PS` | `PSA` |
| 1 Samuel | `1SAM` | `1SA` |
| 1 Kings | `1KGS` | `1KI` |
| 1 John | `1JOHN` | `1JN` |

Default profile slug is `eng-kjv` → use **`JOHN`**, not `JHN`. Faithfull’s `bible-books.ts` maps names → OSIS-short (`JHN`); that works for zefania/usfx but **misses** eng-kjv unless aliased.

### 2.3 Test anonymous reads

In SQL Editor (runs as postgres — simulates service role). For real anon test, use Dashboard → **API** → REST or the checks below once the Next.js client exists.

```sql
-- Translation lookup
select id, slug, format from public.bible_translation where slug = 'eng-kjv';

-- Verse fetch for default translation (OSIS codes)
select verse, text
from public.bible_verse
where translation_id = (select id from public.bible_translation where slug = 'eng-kjv')
  and book_code = 'JOHN'
  and chapter = 3
  and verse = 16;

-- Same verse for a zefania translation (short codes)
select verse, text
from public.bible_verse
where translation_id = (select id from public.bible_translation where slug = 'eng-asv')
  and book_code = 'JHN'
  and chapter = 3
  and verse = 16;

-- Per-translation consistency: John 3:16 must resolve for every slug
-- (pick JOHN or JHN from list_bible_books for that translation_id)
select t.slug, t.format, v.book_code, v.text
from public.bible_translation t
join public.bible_verse v
  on v.translation_id = t.id
 and v.chapter = 3
 and v.verse = 16
 and v.book_code in ('JOHN', 'JHN')
order by t.slug;
-- Expected: 9 rows (one per translation)

-- RPC: books in translation
select * from public.list_bible_books(
  (select id from public.bible_translation where slug = 'eng-kjv')
);

-- RPC: verse counts per translation
select * from public.translation_verse_counts();
```

### 2.4 Test anon key from terminal (optional)

```bash
curl "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bible_translation?slug=eq.eng-kjv&select=id,slug,format" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"

# eng-kjv (OSIS)
curl "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bible_verse?select=book_code,verse,text&book_code=eq.JOHN&chapter=eq.3&verse=eq.16&translation_id=eq.<eng-kjv-uuid>" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Pass:** JSON response with translation/verse rows (not `permission denied`); John 3:16 present for all 9 slugs with the matching book code.
---

## Phase 3 — Auth + profile

### 3.1 Create test user

**Dashboard → Authentication → Users → Add user**

- Email: `test@arclog.local`
- Password: (strong test password)
- Auto-confirm: **yes**

### 3.2 Profile auto-created

```sql
select p.id, p.first_name, p.preferred_translation_slug, u.email
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'test@arclog.local';
```

**Pass:** one profile row; `preferred_translation_slug` defaults to `eng-kjv`.

### 3.3 Update own profile (as authenticated user)

After signing in via app or Supabase Auth API, run as that user:

```sql
-- In SQL Editor this runs as postgres; use REST or app for real RLS test:
update public.profiles
set first_name = 'Test', preferred_translation_slug = 'eng-kjv'
where id = '<user-uuid>';
```

Real RLS test (REST with user JWT):

```bash
# 1. Sign in to get access_token (replace email/password)
curl -X POST "https://gcbousxyszxgvmjoktuz.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@arclog.local","password":"<password>"}'

# 2. Patch profile with returned access_token
curl -X PATCH "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/profiles?id=eq.<user-uuid>" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test"}'
```

**Pass:** 200/204 on PATCH; SELECT returns updated `first_name`.

---

## Phase 4 — Personalization CRUD

Use the test user's JWT from Phase 3. Replace `<TOKEN>` and `<USER_ID>`.

### 4.1 Bookmark

```bash
# Create
curl -X POST "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bookmarks" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","label":"John 3:16","reference":"John 3:16","book_code":"JOHN","chapter":3,"verse":16}'

# List own
curl "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bookmarks?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>"
```

### 4.2 Note

```bash
curl -X POST "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/notes" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","content":"John 3:16\n\nGod loves the world.","reference":"John 3:16"}'
```

### 4.3 Reading progress (mark as read)

```bash
curl -X POST "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/reading_progress" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","last_read_at":"2026-07-28T12:00:00Z","reference":"John 3:16","book_code":"JOHN","chapter":3,"verse":16,"translation_slug":"eng-kjv"}'
```

### 4.4 Latest progress view

```sql
select * from public.latest_reading_progress
where user_id = '<USER_ID>';
```

**Pass:** create returns row; list returns only own rows; view shows most recent `last_read_at`.

---

## Phase 5 — RLS isolation (security)

Create a **second** test user (`test2@arclog.local`). Sign in as user 2 and attempt:

```bash
# Should return empty array (not user 1's bookmarks)
curl "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bookmarks?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <USER2_TOKEN>"

# Should fail or no-op: insert with another user's user_id
curl -X POST "https://gcbousxyszxgvmjoktuz.supabase.co/rest/v1/bookmarks" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <USER2_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<USER1_ID>","label":"Hijack"}'
```

**Pass:**
- User 2 sees zero rows from user 1
- Insert with `user_id` ≠ `auth.uid()` is rejected by RLS

---

## Phase 6 — Next.js server layer (when implemented)

After `src/lib/supabase` and server actions exist:

| Test | How |
|---|---|
| Server component reads Bible chapter | Page renders verse text without login |
| Server action: bookmark | Form POST creates row; appears in profile query |
| Server action: mark as read | Parses reference → inserts `reading_progress` |
| Middleware / SSR session | Refresh page while logged in; session persists |
| Unauthenticated guard | Personalization routes redirect to sign-in |

**Pass:** all flows work through Next.js (not raw curl).

---

## Phase 7 — Faithfull parity checklist

Compare against Faithfull behavior:

| Feature | Faithfull | ARCLOG backend ready? |
|---|---|---|
| List translations | Supabase direct | ☐ |
| Fetch chapter verses | Supabase direct | ☐ |
| Sign up / sign in | Gadget Auth | ☐ Supabase Auth |
| Preferred translation on profile | `user.preferredTranslationSlug` | ☐ `profiles.preferred_translation_slug` |
| Bookmark reference | `bookmark.label` | ☐ `bookmarks.label` + pointer cols |
| Note with embedded ref | `note.content` | ☐ `notes.content` |
| Mark as read | `readingProgress.create` | ☐ `reading_progress` insert |
| Profile activity list | findMany + delete | ☐ REST / server queries |
| Reading calendar | static JSON + above | ☐ static JSON TBD |
| Difficult times | static JSON + above | ☐ static JSON TBD |
| Reading plans | removed | N/A |

---

## Issue triage

| Symptom | Likely cause |
|---|---|
| `permission denied for table bible_*` | Migration `00003` not run, or RLS policy missing |
| Profile missing after signup | Migration `00004` trigger not applied |
| `insert violates row-level security` | `user_id` doesn't match `auth.uid()` |
| Empty verse results | Wrong `translation_id`, or OSIS vs short `book_code` (`JOHN` vs `JHN`, `MATT` vs `MAT`, …) |
| RPC returns nothing | No rows in `bible_verse` for that translation |
| Auth curl fails | Email provider disabled or user not confirmed |

---

## Done definition

Backend is **ready for frontend** when:

1. Phases 1–5 pass
2. Existing Faithfull Bible data readable (anon SELECT + RPCs)
3. Phase 6 passes once server layer is built
4. Phase 7 checklist is all checked

Next step after that: implement new UI/UX on top of verified APIs.
