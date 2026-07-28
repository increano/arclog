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
| Frontend (later) | Next.js 15 (App Router + Edge Middleware), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Supabase Postgres, Auth, RLS |
| SSR / server | Next.js server components, `@supabase/ssr`, `middleware.ts` (OpenNext/Cloudflare) |
| Bible content | `bible_translation` + `bible_verse` (existing Faithfull DB; `book_code` varies by format — OSIS uses `JOHN`/`MATT`, zefania/usfx use `JHN`/`MAT`) |
| Static content | JSON files (calendar, difficult-times topics) — to be added |

## Supabase project

- **Project ref:** `gcbousxyszxgvmjoktuz` (existing Faithfull Bible DB)
- **URL:** `https://gcbousxyszxgvmjoktuz.supabase.co`
- **Bible content:** already seeded (`bible_translation` / `bible_verse` + RPCs)
- **Migrations:** run `00004`–`00006` only for profiles / personalization (see `supabase/README.md`)

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

1. **Database** — reuse Faithfull Bible project; personalization migrations applied
2. **Backend layer** — Supabase clients, middleware session, reference parsing, server actions *(current)*
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

- [ ] Personalization migrations `00004`–`00006` applied without errors
- [ ] Bible verses readable anonymously (anon key) against existing data
- [ ] User can sign up → profile row auto-created
- [ ] Authenticated user can CRUD own bookmarks, notes, progress
- [ ] User cannot read or modify another user's data (RLS enforced)
- [ ] RPCs `translation_verse_counts` and `list_bible_books` return data

## References

- Source app: `/Users/brice/Desktop/DEV/OTHER/FAITHFULL`
- Supabase setup: [supabase/README.md](./supabase/README.md)
- Backend test plan: [BACKEND_TEST_ROADMAP.md](./BACKEND_TEST_ROADMAP.md)
