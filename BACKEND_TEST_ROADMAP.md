# ARCLOG — Backend Test Roadmap

Step-by-step plan to verify the Supabase backend before building the new frontend.

Run migrations first — see [supabase/README.md](./supabase/README.md).

---

## Phase 0 — Prerequisites

- [ ] Supabase project `etcmqhaahuhruwklolxj` is accessible
- [ ] Migrations `00001` → `00006` applied in SQL Editor
- [ ] Auth providers enabled: **Email** (required), **Google** (optional for now)
- [ ] `.env.local` created:

```env
NEXT_PUBLIC_SUPABASE_URL=https://etcmqhaahuhruwklolxj.supabase.co
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

Skip if you already imported Faithfull Bible data. Otherwise run once:

```sql
insert into public.bible_translation (slug, format, title, language_code, source_filename)
values ('eng-kjv', 'osis', 'King James Version', 'en', 'test-seed.sql')
on conflict (slug) do nothing;

insert into public.bible_verse (translation_id, book_code, chapter, verse, text)
select t.id, 'JHN', 3, 16, 'For God so loved the world...'
from public.bible_translation t
where t.slug = 'eng-kjv'
on conflict do nothing;
```

### 2.2 Test anonymous reads

In SQL Editor (runs as postgres — simulates service role). For real anon test, use Dashboard → **API** → REST or the checks below once the Next.js client exists.

```sql
-- Translation lookup
select id, slug from public.bible_translation where slug = 'eng-kjv';

-- Verse fetch (calendar / difficult-times pattern)
select verse, text
from public.bible_verse
where translation_id = (select id from public.bible_translation where slug = 'eng-kjv')
  and book_code = 'JHN'
  and chapter = 3
order by verse;

-- RPC: books in translation
select * from public.list_bible_books(
  (select id from public.bible_translation where slug = 'eng-kjv')
);

-- RPC: verse counts per translation
select * from public.translation_verse_counts();
```

### 2.3 Test anon key from terminal (optional)

```bash
curl "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/bible_translation?slug=eq.eng-kjv&select=id,slug" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $NEXT_PUBLIC_SUPABASE_ANON_KEY"
```

**Pass:** JSON response with translation row (not `permission denied`).

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
curl -X POST "https://etcmqhaahuhruwklolxj.supabase.co/auth/v1/token?grant_type=password" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@arclog.local","password":"<password>"}'

# 2. Patch profile with returned access_token
curl -X PATCH "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/profiles?id=eq.<user-uuid>" \
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
curl -X POST "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/bookmarks" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","label":"John 3:16","reference":"John 3:16","book_code":"JHN","chapter":3,"verse":16}'

# List own
curl "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/bookmarks?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>"
```

### 4.2 Note

```bash
curl -X POST "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/notes" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","content":"John 3:16\n\nGod loves the world.","reference":"John 3:16"}'
```

### 4.3 Reading progress (mark as read)

```bash
curl -X POST "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/reading_progress" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id":"<USER_ID>","last_read_at":"2026-07-28T12:00:00Z","reference":"John 3:16","book_code":"JHN","chapter":3,"verse":16,"translation_slug":"eng-kjv"}'
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
curl "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/bookmarks?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer <USER2_TOKEN>"

# Should fail or no-op: insert with another user's user_id
curl -X POST "https://etcmqhaahuhruwklolxj.supabase.co/rest/v1/bookmarks" \
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
| Empty verse results | Bible data not seeded |
| RPC returns nothing | No rows in `bible_verse` for that translation |
| Auth curl fails | Email provider disabled or user not confirmed |

---

## Done definition

Backend is **ready for frontend** when:

1. Phases 1–5 pass
2. At least one full translation seeded (or Faithfull import complete)
3. Phase 6 passes once server layer is built
4. Phase 7 checklist is all checked

Next step after that: implement new UI/UX on top of verified APIs.
