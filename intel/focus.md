# Current Focus

**Active initiative:** Category management complete — next: auth guard + /shop page
**Blockers:** none
**Next decision needed:** Auth strategy for /admin (Supabase Auth vs simple env-var secret gate)

## What was completed (session 2026-06-20)

- DB password rotated and added to `.env.local`
- SQL migration run — 6 tables live in Supabase
- TypeScript types written: `app/src/types/database.ts`
- `middleware.ts` deleted (conflict with Next.js 16 `proxy.ts`)
- Admin dashboard built and styled:
  - `src/lib/supabase/service.ts` — service role client
  - `src/app/[locale]/admin/layout.tsx` — Spectral/Instrument Sans header
  - `src/app/[locale]/admin/products/page.tsx` — product list
  - `src/app/[locale]/admin/products/new/page.tsx` — create form
  - `src/app/[locale]/admin/products/[id]/edit/page.tsx` — edit form
  - `_components/ProductForm.tsx` — full design from claude.ai/design (warm palette, sidebar, sticky action bar)
  - `_components/actions.ts` — server actions with image upload
  - `_components/DeleteButton.tsx` — client delete with confirm

## What was completed (session 2026-06-20 — categories)

- Category management: full CRUD at `/fr/admin/categories`
- `src/lib/slugify.ts` — shared util (extracted from products)
- `AdminNav` client component with dynamic active state, Catégories link added
- ProductForm: "+ Nouvelle catégorie ↗" link opens new tab
- Delete guards: blocks on products AND child categories
- Known debt recorded in state.md

## Immediate next steps (in order)

1. **Auth guard** on `/admin/**` — no public access before go-live
2. **`/shop` page** — product grid from Supabase (anon key, RLS public read)
3. Sub-pages: `/chemicals`, `/glassware`, `/lab-equipment`, `/about`, `/contact`, `/catalogues`
4. Checkout flow (CMI + COD)
5. Compliance note — `compliance/regulatory-track.md` (Law 09-08)
