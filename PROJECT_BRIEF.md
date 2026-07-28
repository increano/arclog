# ARCLOG — Project Brief

## Overview

**ARCLOG** is a self-hosted reimplementation of the [Faithfull](https://github.com/increano/bible) Bible reading app, migrated off the Gadget.dev stack to a stack we fully own.

The product goal is unchanged: help users read Scripture daily, save bookmarks and notes, and track reading progress — with Bible text served from our own database.

## Why migrate

| Before (Faithfull) | After (ARCLOG) |
|---|---|
| Gadget backend + auth | Supabase (Postgres + Auth + RLS) |
| React Router frontend on Gadget | Next.js App Router |
| Mixed env (`GADGET_PUBLIC_*`, `VITE_*`) | Standard Next.js + Supabase env |
| Vendor-managed models/actions | SQL migrations + server actions / API routes |

## Stack

| Layer | Technology |
|---|---|
| Frontend (later) | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase Postgres, Auth, RLS |
| SSR / server | Next.js server components, `@supabase/ssr` |
| Bible content | `bible_translation` + `bible_verse` tables (ported from Faithfull) |
| Static content | JSON files (calendar, difficult-times topics) — to be added |

## Supabase project

- **Org:** `snfvmlijhaftrtzcjpet`
- **Project ref:** `etcmqhaahuhruwklolxj`
- **URL:** `https://etcmqhaahuhruwklolxj.supabase.co`
- **Migrations:** `supabase/migrations/` (run manually in SQL Editor)

## Scope

### In scope (backend MVP)

1. **Auth** — email/password + Google OAuth via Supabase Auth
2. **Profiles** — name, preferred translation, last signed in
3. **Bible reads** — public SELECT on translations/verses + RPC helpers
4. **Personalization** — bookmarks, notes, reading progress (user-scoped)
5. **RLS** — users can only read/write their own rows
6. **Reference parsing** — port Faithfull pointer logic (John 8:34-36 → book/chapter/verse)

### Out of scope (for now)

- Reading plans (`readingPlan`, `userReadingPlan`) — removed in Faithfull
- Shopify / multi-tenant shop models
- New UI/UX design (frontend comes after backend is verified)
- Gadget-specific session model

## Data model

```
auth.users
    └── profiles (1:1)
    ├── bookmarks (n)
    ├── notes (n)
    └── reading_progress (n)   ← append-only events; latest = resume pointer

bible_translation 1──n bible_verse
```

Faithfull Gadget model mapping:

| Gadget | ARCLOG |
|---|---|
| `user` (profile fields) | `auth.users` + `profiles` |
| `bookmark` | `bookmarks` |
| `note` | `notes` |
| `readingProgress` | `reading_progress` |
| Bible text | `bible_translation` / `bible_verse` |

## Development phases

1. **Database** — run SQL migrations, seed Bible data *(current)*
2. **Backend layer** — Supabase clients, server actions, reference parsing
3. **Backend verification** — manual + SQL test checklist ([BACKEND_TEST_ROADMAP.md](./BACKEND_TEST_ROADMAP.md))
4. **Frontend** — new UI/UX direction on top of proven backend

## Repository layout (target)

```
ARCLOG/
├── PROJECT_BRIEF.md          ← this file
├── BACKEND_TEST_ROADMAP.md   ← how to verify backend works
├── supabase/
│   ├── README.md
│   └── migrations/           ← SQL files (run in order)
├── src/
│   ├── app/                  ← Next.js routes (minimal until UI phase)
│   └── lib/                  ← Supabase clients, domain logic
└── data/                     ← static JSON (calendar, topics) — TBD
```

## Success criteria (backend)

- [ ] All 6 migrations applied without errors
- [ ] Bible verses readable anonymously (anon key)
- [ ] User can sign up → profile row auto-created
- [ ] Authenticated user can CRUD own bookmarks, notes, progress
- [ ] User cannot read or modify another user's data (RLS enforced)
- [ ] RPCs `translation_verse_counts` and `list_bible_books` return data

## References

- Source app: `/Users/brice/Desktop/DEV/OTHER/FAITHFULL`
- Supabase setup: [supabase/README.md](./supabase/README.md)
- Backend test plan: [BACKEND_TEST_ROADMAP.md](./BACKEND_TEST_ROADMAP.md)
