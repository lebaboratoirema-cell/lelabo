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
- **SQL migration run** — 6 tables live in Supabase (categories, products, product_variants, product_images, orders, order_items)
- **TypeScript types written** — `app/src/types/database.ts`
- **Supabase Storage bucket created** — `product-images` (public, 5MB limit, jpg/png/webp)
- **Admin dashboard built** — `/fr/admin/products` (list), `/fr/admin/products/new` (create), `/fr/admin/products/[id]/edit` (edit)
  - Service role client at `src/lib/supabase/service.ts`
  - Server actions: createProduct, updateProduct, deleteProduct (with image cleanup)
  - Image upload to Supabase Storage with previews
  - Design: Instrument Sans + Spectral, warm palette, sidebar + sticky action bar (from claude.ai/design p/1fe8ae7b)
- **Category management built** — `/fr/admin/categories` (list), `/fr/admin/categories/new` (create), `/fr/admin/categories/[id]/edit` (edit)
  - Full CRUD: createCategory, updateCategory, deleteCategory
  - Delete guard: blocks if products or child categories still reference the category
  - Slug auto-generated from French name, user-editable
  - Parent category select (self excluded on edit to prevent cycles)
  - Dynamic nav in admin header highlights active section (AdminNav client component)
  - ProductForm now has "+ Nouvelle catégorie ↗" link (opens new tab)
  - Shared `src/lib/slugify.ts` used by both products and categories

- **Sub-pages built** — all 7 public pages implemented from design (claude.ai/design project 706e2d4a):
  - `src/app/[locale]/about/page.tsx` — about copy + value cards + stats
  - `src/app/[locale]/contact/page.tsx` — contact form + map
  - `src/app/[locale]/chemicals/page.tsx` — DB-driven, wired to Supabase
  - `src/app/[locale]/glassware/page.tsx` — DB-driven, wired to Supabase
  - `src/app/[locale]/lab-equipment/page.tsx` — DB-driven, wired to Supabase
  - `src/app/[locale]/shop/page.tsx` — category card grid + CTA band
  - `src/app/[locale]/catalogues/page.tsx` — catalogue download cards

- **Subcategory pages built** — DB-driven dynamic routes under all 3 category families:
  - `src/app/[locale]/chemicals/[subcategory]/page.tsx`
  - `src/app/[locale]/glassware/[subcategory]/page.tsx`
  - `src/app/[locale]/lab-equipment/[subcategory]/page.tsx`
  - Shared `src/components/ProductGrid.tsx` — product card grid (server)
  - Shared `src/components/CategoryChips.tsx` — chip nav with active state (server)
  - `src/lib/supabase/queries.ts` — `getCategoryBySlug`, `getChildCategories`, `getProductsByCategory`
  - `src/lib/categoryRoutes.ts` — slug config: `chimie` / `verrerie` / `equipements`
  - 404 on unknown slugs; parent_id guard against URL manipulation

## Blocking / not yet done
- No auth guard on `/admin` routes (anyone can access — add before going live)
- No CMI integration
- No auth flow (admin vs customer)
- Law 09-08 compliance note not yet added to `compliance/regulatory-track.md`

## Next session: start here

1. Add auth guard to `/admin` routes (Supabase Auth or simple secret env var gate)
2. Checkout / quote flow (CMI + COD)
3. Add compliance note to `compliance/regulatory-track.md` (Law 09-08 PII retention)

## Known tech debt
- Admin routes hardcoded to `/fr/` locale — acceptable for French-only MVP, must grep-replace before adding any second locale
- `updateProduct` deletes + re-inserts all variants on save (no FK-safe upsert) — risk if `order_items.variant_id` references are added
- No cycle detection in `updateCategory` parent_id — UI prevents immediate self-loop but not deeper chains
