# Project State

**Status:** Active development — schema designed, migration ready to run
**Last updated:** 2026-06-20

## Stack (locked)
- **Framework:** Next.js 16.2.9 (App Router, TypeScript, Tailwind v4)
- **Hosting:** Vercel → VPS (later)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Payments:** CMI + Cash on delivery
- **Languages:** French (default) + English (next-intl v4)
- **App dir:** `app/` (Next.js lives here, command centre at root)

## What exists
- Command centre scaffolded (blueprints/, equipment/, security/, compliance/)
- Next.js 16 app scaffolded in `app/`
- next-intl wired: `src/proxy.ts`, `src/i18n/routing|request|navigation.ts`
- Supabase clients: `src/lib/supabase/server.ts` + `client.ts`
- `.env.local` filled with real Supabase URL + keys
- Messages: `messages/fr.json` + `messages/en.json` (minimal)
- **Homepage fully implemented** from design (claude.ai/design project 706e2d4a):
  - `src/components/TopBar.tsx` — info bar (server)
  - `src/components/Header.tsx` — sticky nav + mobile menu (client)
  - `src/components/HeroSlider.tsx` — 3-slide carousel (client)
  - `src/components/ContactStrip.tsx` — phone/address/hours strip (server)
  - `src/components/AboutSection.tsx` — about copy + images (server)
  - `src/components/PromoSection.tsx` — two-panel promo (server)
  - `src/components/ServicesSection.tsx` — 6 service cards (server)
  - `src/components/BrandsSection.tsx` — brand logos (server)
  - `src/components/StatsSection.tsx` — animated counters (client)
  - `src/components/SiteFooter.tsx` — footer + contact form (server)
  - `src/components/ScrollReveal.tsx` — scroll animation driver (client)
- Images in `app/public/images/`: logo, 3 hero images, glassware, analysis, culture, pipette, safety, dna
- Build: clean (TypeScript + Next.js 16.2.9)
- **Schema designed + approved** — spec at `docs/superpowers/specs/2026-06-20-database-schema-design.md`
- **SQL migration written** — `supabase/migrations/001_initial_schema.sql` (ready to run)
- **Supabase Storage bucket created** — `product-images` (public, 5MB limit, jpg/png/webp)

## Blocking / not yet done
- **SQL migration not yet run** — needs DB password to execute `supabase/migrations/001_initial_schema.sql`
  - Get password: Supabase dashboard → Settings → Database → Connection string
- TypeScript types not yet written (`app/src/types/database.ts`)
- Law 09-08 compliance note not yet added to `compliance/regulatory-track.md`
- No product catalog schema in DB (tables not created yet)
- No admin dashboard (product management)
- No CMI integration
- No auth flow (admin vs customer)
- Sub-pages not built: /shop, /chemicals, /glassware, /lab-equipment, /about, /contact, /catalogues

## Next session: start here
1. Run SQL migration — get DB password from Supabase → Settings → Database, then run `supabase/migrations/001_initial_schema.sql`
2. Write `app/src/types/database.ts` (TypeScript types — plan at `docs/superpowers/plans/2026-06-20-database-schema.md` Tasks 4+5)
3. Build admin dashboard: `/admin/products` (list + add + edit)
4. Build `/shop` page pulling from Supabase
