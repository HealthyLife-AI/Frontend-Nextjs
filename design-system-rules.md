# Figma → Code Design System Rules

Reference doc for any agent (Figma MCP or otherwise) generating or syncing
UI code in this repo (`Frontend/healthylife-dashboard`). Read this before
translating a Figma frame into components.

## 0. The one rule that overrides all others

**SUPERSEDED 2026-09-23 — Figma is now binding law, project-wide.**
Per explicit user decision, this reverses the PRD-tokens-first rule below
in full: colors, spacing, and copy/numbers all come from Figma now, not
just layout/structure. This is a deliberate, acknowledged deviation from
`HealthyLifeAI_PRD.docx` §5.1 (see quote below) — flagged here rather than
silently overridden. Existing PRD-token-based screens (dashboard, clients,
meal plans, etc.) are not being retroactively rewritten by this change;
they get resynced to Figma as each one is next touched, not in a bulk pass.

Previous rule, kept for context:

> "Stitch mockups are references; the code must conform to these tokens,
> not the other way around." — `HealthyLifeAI_PRD.docx` §5.1

The approved design reference at
`design-reference/stitch_arabic_nutritionist_client_dashboard/serene_clinical_intelligence/DESIGN.md`
uses a raw Material-3 tonal color ramp that **disagrees** with the PRD's
flatter palette (e.g. its `primary: #006572` vs. the PRD/code's
`--color-primary: #028090`) — this is exactly the kind of disagreement
that used to be resolved in the PRD's favor and is now resolved in
Figma's favor instead:

1. Use the Figma frame's own fill/color/type values directly — update
   `globals.css` tokens to match Figma rather than forcing Figma into an
   existing PRD token.
2. Port the Figma frame's layout, spacing, and component structure as before.
3. Figma's copy, including specific numeric claims (headcounts,
   percentages, etc.) with no backing data, is adopted as-is too — the
   earlier no-fake-stats rule (see `page.tsx`'s current comment, now
   stale) is superseded by this same decision. Update `SocialProofSection`
   copy to match Figma's stated numbers instead of the qualitative-only
   phrasing.

## 1. Token Definitions

**Where:** `src/app/globals.css` — single source of truth. No `tailwind.config.js` (Tailwind v4, CSS-first config).

**Format:** CSS custom properties on `:root`, re-exported through an
`@theme inline` block so Tailwind generates utility classes from them
(`bg-primary`, `text-ink-muted`, `rounded-card`, etc.). Two-layer indirection
is intentional — `:root` holds the literal PRD hex values with a comment
explaining provenance; `@theme inline` maps each one into Tailwind's
namespace, one line each, no renaming.

```css
:root {
  --color-primary: #028090;
  --color-accent: #02c39a;
  --color-canvas: #f5faf9;
  --color-ink: #0b2e30;
  --color-status-on-track: #02c39a;
  --color-status-attention: #b9770e;
  --color-status-late: #c0392b;
  --radius-control: 0.5rem;  /* 8px */
  --radius-card: 0.75rem;    /* 12px */
  --radius-chip: 0.375rem;   /* 6px */
  --font-cairo: "Cairo", "Segoe UI", sans-serif;
  --font-inter: "Inter", "Segoe UI", sans-serif;
  --shadow-card: 0 1px 2px rgba(11,46,48,.04), 0 8px 24px -8px rgba(11,46,48,.10);
}
@theme inline {
  --color-primary: var(--color-primary);
  /* ...one line per token, mirrored 1:1... */
}
```

### Token catalog (use these Tailwind utilities, never raw hex)

| Category | Tokens | Utilities |
|---|---|---|
| Brand | `--color-primary` `#028090`, `--color-primary-hover` `#026e7c`, `--color-accent` `#02c39a`, `--color-accent-hover` `#02aa86`, `--color-accent-active` `#019475` | `bg-primary`, `text-primary`, `bg-accent`, `hover:bg-accent-hover` |
| Surface | `--color-canvas` `#f5faf9`, `--color-card` `#ffffff`, `--color-border` `#e1ecec`, `--color-divider` `#f0f5f4` | `bg-canvas`, `bg-card`, `border-border` |
| Text | `--color-ink` `#0b2e30`, `--color-ink-muted` `#5c7a7c` | `text-ink`, `text-ink-muted` |
| Status (semantic, direction-based per BR-14 — see DESIGN.md) | `on-track` `#02c39a`/bg `#e0f8f2`, `attention` `#b9770e`/bg `#fbf1e0`, `late` `#c0392b`/bg `#fbe6e4` | `bg-status-on-track-bg text-status-on-track`, etc. |
| Danger | `--color-danger` `#c0392b` | `text-danger`, `border-danger` |
| Radius | `control` 8px (buttons/inputs), `card` 12px (cards/panels), `chip` 6px (status chips) | `rounded-control`, `rounded-card`, `rounded-chip` |
| Elevation | `shadow-card`, `shadow-card-hover`, `shadow-float` | `shadow-card`, `hover:shadow-card-hover` |
| Type face | `font-cairo` (Arabic), `font-inter` (English) | set automatically via `html[data-locale]`, not per-component |

**No token transformation pipeline exists** (no Style Dictionary, no
Figma Tokens plugin JSON, no build-time token generation). Tokens are
hand-authored directly in CSS from the PRD's written spec. If Figma
exposes variables via `get_variable_defs`, cross-check them against this
table — don't add a new token without a matching PRD/DESIGN.md value.

**Full type scale, spacing scale, and elevation layers** (not yet all
wired into `globals.css`, but binding for new work) live in
`design-reference/.../serene_clinical_intelligence/DESIGN.md` frontmatter
(`typography:`, `spacing:`, `rounded:` YAML blocks) — e.g. `headline-sm`
16px/26px/500, `body-md` 14px/24px/400, `space-md` 1rem. Colors in that
same frontmatter are **not** binding (see §0); typography/spacing/radius
values are, since the PRD doesn't specify its own scale for those.

## 2. Component Library

**Where:** `src/components/`, organized by domain, not by atomic-design tier:

```
src/components/
  ui/           # generic primitives: Button, Badge, Select, TextField, TagInput
  layout/       # AppShell, Header, Sidebar, LocaleSwitcher
  auth/         # LoginForm, RegisterForm, AuthProvider, ActivateClientForm
  clients/      # AddClientForm, ClientStatusBadge, StatTile, DashboardStatTiles, ...
  mealPlans/    # PlanDesigner, MealCard, MealItemRow, FoodAutocomplete, ...
  progress/     # WeightTrendChart, PlanVsActualChart, BodyCompositionCards, ...
  aiSummaries/  # AiSummaryCard
  home/         # marketing/landing page sections (Hero, FaqSection, ...)
```

**Architecture:** plain function components, `forwardRef` only where a DOM
ref is meaningfully consumed by a parent (`Button`, `TextField`). No
class components, no HOC wrapping, no component-per-file barrel/index
re-exports — import directly from the file (`@/components/ui/Button`).

**Composition pattern for new primitives** — study `src/components/ui/Button.tsx`:
- Extend the native HTML element's props type (`ButtonHTMLAttributes<HTMLButtonElement>`), don't hand-roll a prop list that duplicates it.
- A closed union of `variant`/`tone` string literals, not booleans (`variant: "primary" | "secondary" | "ghost"`, not `isPrimary?: boolean`).
- A `Record<Variant, string>` map of Tailwind classes per variant, composed as `` `${base} ${variants[variant]} ${className}` `` so callers can still append utility overrides.
- JSDoc-style comment above the component citing **which spec it implements** and any non-obvious rule (see `Badge.tsx`: "Status is never color alone").

**No Storybook, no component documentation site.** The nearest thing to
component docs is the source comment block above each component plus the
Stitch `screen.png` / `code.html` references in `design-reference/`. When
building a new component from a Figma frame, mirror this same
comment-with-citation pattern — reference the PRD section or DESIGN.md
rule the component implements.

**No component test files exist yet.** Playwright is a devDependency (see
README's "Verified" deploy section) but used ad hoc for manual flows, not
as a checked-in test suite — don't assume `*.spec.ts` files exist to update.

## 3. Frameworks & Libraries

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5, strict mode on.
- **Styling:** Tailwind CSS v4, CSS-first config (`@import "tailwindcss"` + `@theme inline` in `globals.css` — no `tailwind.config.js`/`.ts` file exists or should be created).
- **i18n:** `next-intl` — every route is locale-prefixed (`/ar/...` default+RTL, `/en/...`). Routing config: `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`.
- **Icons:** `lucide-react` (see §5).
- **Build tool:** Next's own bundler (Turbopack under the hood) via `next dev` / `next build`. No separate Vite/Webpack config.
- **Package manager:** npm (`package-lock.json` present; use `npm install`, not yarn/pnpm).
- **Linting:** ESLint 9 flat config (`eslint.config.mjs`), extends `eslint-config-next` core-web-vitals + typescript presets. No Prettier config found — formatting follows ESLint + editor defaults.

## 4. Asset Management

- **Static assets:** `public/` (only `favicon.ico` currently checked in at app root; no `public/images/` tree yet).
- **Design reference assets:** `design-reference/stitch_arabic_nutritionist_client_dashboard/<screen>/screen.png` + `code.html` per Stitch-generated screen — these are source material to read, never to import or ship.
- **No image CDN / next/image remote pattern configuration** in `next.config.ts` yet — it's a near-empty config (see below). Any new image domain (e.g. Figma-exported assets, avatar uploads) needs an explicit `images.remotePatterns` entry before `next/image` can load it.
- **No SVG-to-component pipeline** (no SVGR). Inline SVGs are hand-written directly in `.tsx` files when lucide-react doesn't have the icon (see `EyeIcon`/`EyeOffIcon` in `TextField.tsx`) — `viewBox="0 0 24 24"`, `stroke="currentColor"`, `aria-hidden="true"`, no hardcoded fill colors so they inherit `text-*` utilities.
- **Figma asset exports:** when `download_assets`/`upload_assets` pulls raster images or SVGs from a frame, land icons as inline `currentColor` SVG components following the pattern above (never as static `.svg` files needing a `<img>` tag, unless the asset is genuinely a raster photo/illustration — then `public/` + `next/image`).

## 5. Icon System

**Library:** `lucide-react` exclusively — no custom icon font, no SVG sprite sheet, no separate icon component library.

**Import & usage pattern** (from `Sidebar.tsx`):

```tsx
import { LayoutGrid, Users, UtensilsCrossed, Bell, Settings, X } from "lucide-react";

// Icons are typed and passed as component references, not JSX, when
// they need to flow through a data structure:
type NavItem = {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
};
const NAV_ITEMS: NavItem[] = [{ icon: LayoutGrid, /* ... */ }];

// Rendered with explicit size + strokeWidth — never left at defaults:
<Icon size={20} strokeWidth={1.75} />
```

**Conventions:**
- `strokeWidth={1.75}` is the house standard for nav/content icons (matches DESIGN.md's restrained-weight rule); `strokeWidth={1.6}` for small inline utility icons (password toggle, ~18px).
- Sizes are contextual: `18` (compact/inline controls), `20` (nav items), `22` (stat tile badges) — pick by matching the surrounding component's existing icon size, not a fixed global default.
- Icon-in-tinted-badge is a named pattern (`StatTile.tsx`): the icon's color and its background tint must come from the **same** semantic tone token (`TONE_CLASSES` map), never independently chosen — this is called out explicitly as a rule in the component's own comment.
- RTL: no manual mirroring needed for lucide icons in this codebase's current usage (no directional chevron/arrow icons yet) — if one is introduced, wrap it so it flips via a logical/`rtl:` utility rather than swapping icon components per locale.
- Naming: import lucide icons by their exact exported name (PascalCase, e.g. `UtensilsCrossed`), never aliased to something generic — keeps the icon traceable back to the Lucide set when auditing.

## 6. Styling Approach

**Methodology:** Tailwind utility classes directly in JSX (no CSS Modules, no styled-components/Emotion, no CSS-in-JS). `globals.css` holds only: `@import "tailwindcss"`, the `:root`/`@theme inline` token blocks, two `body`/`html[data-locale]` global rules, and the homepage's `@keyframes float-y` (explicitly scoped as marketing-page-only, kept out of `@theme` since it's not a token).

**Global styles are minimal by design** — almost everything is per-component utility classes built from tokens. Don't add component-specific rules to `globals.css`; a new component's styling lives in its own `.tsx` file as Tailwind classes.

**RTL / logical properties — hard rule, not a preference:**
Arabic (`dir="rtl"`, default locale) and English (`dir="ltr"`) share one
component tree with no mirrored layout branch. This only works because
every layout class is **logical**, never physical:

| Use | Never use |
|---|---|
| `ps-*` / `pe-*` (padding-inline-start/end) | `pl-*` / `pr-*` |
| `start-*` / `end-*` | `left-*` / `right-*` |
| `border-s` / `border-e` | `border-l` / `border-r` |
| `text-start` / `text-end` | `text-left` / `text-right` |

The one exception CSS itself doesn't have a logical property for is
`translate-x-*` (used for the off-canvas sidebar transform) — there it's
spelled out explicitly per direction with `rtl:`/`ltr:` variants, scoped
under a viewport prefix (`max-lg:rtl:translate-x-full max-lg:ltr:-translate-x-full`)
so the direction-specific class can't also fight a `lg:` desktop override
(see the extensive comment in `Sidebar.tsx` explaining a real bug this
caused). When a Figma frame implies a transform/animation that's
direction-sensitive, follow this same `max-{breakpoint}:{dir}:` scoping
pattern rather than adding a parallel `lg:` override class.

**Responsive design:** standard Tailwind breakpoint prefixes (`sm:`, `lg:`)
mobile-first, no custom breakpoints beyond Tailwind's defaults. Sidebar is
the reference pattern: persistent rail at `lg:` and up, off-canvas drawer
with backdrop below it.

**Font-family switching:** never set `font-cairo`/`font-inter` per
component. It's set once, globally, keyed off `html[data-locale]` (set in
`src/app/[locale]/layout.tsx`) — every element inherits the correct face.

**Hardcoded hex values are disallowed outside `globals.css`.** Every
color in a component must resolve through a token utility (`bg-primary`,
`text-status-late`, `bg-accent/10`, using Tailwind's opacity-modifier
syntax for tints). The two documented exceptions are bespoke shadow
values tuned per-component (`Button.tsx`'s glow shadows, `Sidebar.tsx`'s
logo badge shadow) — these use `shadow-[...]` arbitrary values because
they're one-off compositions of the ink/accent tokens at custom alpha,
not reusable tokens themselves.

## 7. Project Structure

```
Frontend/healthylife-dashboard/
  src/
    app/
      [locale]/
        (auth)/          # route group: login, register, activate — no shared chrome
        (dashboard)/     # route group: dashboard/*, patients/*, plans/*, alerts/*, settings — wrapped in AppShell
        layout.tsx       # sets <html dir/data-locale>, loads next-intl provider
        page.tsx         # marketing/landing page (home/* components)
      api/auth/*         # BFF route handlers proxying to Laravel (never called directly from client fetches elsewhere)
      globals.css
    components/          # see §2 — domain-organized, not atomic-design tiers
    lib/
      <domain>/api.ts    # fetch wrappers per domain (clients, mealPlans, progress, alerts, aiSummaries, nutritionists, auth)
      <domain>/types.ts  # TypeScript types co-located with that domain's api.ts
      api.ts             # shared fetch helper
    i18n/                 # next-intl routing/navigation/request config
    messages/ar.json, en.json   # all user-facing strings — never hardcode text in a component
    proxy.ts              # Next's request-interception layer (route protection gate)
```

**Feature organization pattern:** each business domain (clients, meal
plans, progress, alerts, AI summaries) gets a matching pair —
`components/<domain>/` for UI and `lib/<domain>/{api.ts,types.ts}` for
data — plus its route(s) under `app/[locale]/(dashboard)/dashboard/<domain>/`.
When scaffolding a new domain from a Figma frame, create this same
three-part shape rather than inlining fetch logic into the page component.

**Path alias:** `@/*` → `src/*` (tsconfig `paths`). Always import via
`@/components/...`, `@/lib/...`, `@/i18n/...` — never relative
`../../../` chains.

**Locale-aware routing helpers:** always import `Link`, `useRouter`,
`usePathname` from `@/i18n/navigation` (the next-intl-wrapped versions),
never from `next/link` or `next/navigation` directly — the wrapped
versions handle the `/ar`/`/en` prefix automatically.

---

## Applying a new Figma frame — checklist

1. Resolve every color/radius/shadow in the frame to a token from §1's
   catalog. If a Figma variable doesn't map to an existing token, stop
   and check the PRD (`HealthyLifeAI_PRD.docx` §5.1) before inventing one.
2. Place the component under the matching domain in `src/components/`
   (§2/§7) — don't create a new top-level folder for one component.
3. Use `lucide-react` for icons; only hand-write inline SVG if lucide
   has no matching icon (§5).
4. Write every layout class as a logical property (§6's table) — a
   frame's LTR pixel positions (`left`, `pl-4`, etc.) must be translated,
   not copied literally.
5. Add every user-facing string to **both** `messages/ar.json` and
   `messages/en.json` — never inline text.
6. If the frame disagrees with the PRD's binding tokens (§0), the PRD
   wins; flag the discrepancy to the user rather than silently choosing.
