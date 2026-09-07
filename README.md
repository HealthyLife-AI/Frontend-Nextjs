# HealthyLife AI — Nutritionist Dashboard (Next.js)

The nutritionist-facing web dashboard. Talks to the Laravel API in
`Backend/HealthyLife-Laravel`. This implements Sprint 1's Frontend Developer
(Web Dashboard) tasks from the Sprint 1–3 task breakdown: project/theme setup,
login/register, and the dashboard shell.

## Stack

- Next.js 16, App Router, TypeScript
- Tailwind CSS v4 (tokens defined in `src/app/globals.css` via `@theme`)
- `next-intl` for Arabic (default, RTL) / English (LTR) routing — every route is
  `/ar/...` or `/en/...`
- `lucide-react` for icons

## Local setup

```bash
npm install
cp .env.example .env.local   # LARAVEL_API_URL — see below
npm run dev
```

Open `http://localhost:3000` — it redirects to `/ar/login` (Arabic is the
default locale; MVP spec §0 targets the Arabic market first). Swap to English
with the locale switcher in the header/auth card, or go straight to
`/en/login`.

The Laravel backend (`Backend/HealthyLife-Laravel`) must be running at the
URL in `LARAVEL_API_URL` (`php artisan serve`, default
`http://127.0.0.1:8000/api/v1`) with its database migrated and seeded — see
that project's README.

## Design tokens

`src/app/globals.css` defines the binding tokens from PRD §5.1 (primary
teal `#028090`, accent mint `#02C39A`, canvas `#F5FAF9`, Cairo/Inter,
`8px`/`12px` radii). Where the approved Stitch reference
(`design-reference/stitch_arabic_nutritionist_client_dashboard`) disagreed —
its raw Material-3 tonal ramp uses different hex values than its own written
brand spec — the PRD's tokens win, per the PRD's own rule: *"Stitch mockups
are references; the code must conform to these tokens, not the other way
around."* The Stitch reference's **layout and component structure** (the
right-docked, fixed-width sidebar; the header composition; spacing scale)
is what `Sidebar`/`Header`/`AppShell` are ported from.

Don't hardcode hex values in components — every token is a Tailwind utility
(`bg-primary`, `text-ink-muted`, `rounded-card`, `bg-status-late-bg`, …).

## Authentication (BFF pattern)

The browser never calls the Laravel API directly — it only calls this app's
own route handlers under `src/app/api/auth/*`, which proxy to Laravel
(`src/lib/auth/api.ts`).

| Route | What it does |
|---|---|
| `POST /api/auth/register`, `/login` | Proxies to Laravel, then sets the returned refresh token as an **HttpOnly** cookie (`hl_refresh`, see `src/lib/auth/session.ts`) and returns only `{ user, access_token, expires_in }` to the browser. |
| `POST /api/auth/refresh` | Reads the HttpOnly cookie, calls Laravel's rotating refresh endpoint, sets the new cookie, returns a new access token. |
| `POST /api/auth/logout` | Revokes the session's refresh token and clears the cookie. |
| `GET /api/auth/me` | Passthrough to Laravel using whatever `Authorization: Bearer` header the client sends. |

The access token is **never** persisted (no cookie, no localStorage) — it
lives only in memory, in `AuthProvider` (`src/components/auth/AuthProvider.tsx`).
A hard reload always starts from `status: "loading"` and silently
re-derives a fresh access token by calling `/api/auth/refresh` (using the
HttpOnly cookie the browser sends automatically) and then `/api/auth/me`.

Route protection is two layers, matching the backend's "permission alone
isn't security" principle:
1. `src/proxy.ts` (Next's request-interception layer, née "middleware")
   redirects any `/{locale}/dashboard*` request with no `hl_refresh` cookie
   straight to `/login` — a fast, cheap gate.
2. `AppShell` redirects client-side if the silent refresh above resolves to
   `unauthenticated` (covers an expired/revoked cookie the gate above can't
   detect without calling the API).

Neither layer is the real security boundary — that's the Laravel API's JWT
middleware and per-nutritionist data-isolation scope, enforced on every
request regardless of what this frontend does.

## Internationalization / RTL

Arabic is `dir="rtl"`, English is `dir="ltr"` (`src/i18n/routing.ts`,
applied on `<html>` in `src/app/[locale]/layout.tsx`). All layout components
use **logical** Tailwind properties (`ps-*`/`pe-*`, `start-*`/`end-*`), never
physical ones (`pl-*`/`right-*`) — the sidebar docks to the inline-start edge
(right in Arabic, left in English) and the rest of the shell follows without
a separate mirrored layout per direction. Add new locale strings to both
`src/messages/ar.json` and `src/messages/en.json`; never hardcode
user-facing text in a component.

## What's next (Sprint 2)

The dashboard shell is intentionally empty past its placeholder card —
`src/app/[locale]/(dashboard)/dashboard/page.tsx` is where the client list,
overview stat tiles, and filters from the approved Stitch mockup
(`nutricare_3`) land once Sprint 2's client model and API exist.
