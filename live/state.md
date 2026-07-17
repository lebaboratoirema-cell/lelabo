# Project State

**Status:** Active development — schema designed, migration ready to run
**Last updated:** 2026-06-21

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

- **Admin auth guard implemented** — Supabase email+password via `src/proxy.ts` session check
  - All `/[locale]/admin/*` routes (except `/admin/login`) require authenticated Supabase session
  - Unauthenticated access: URL-preserving rewrite to `/403` page
  - Login at `/[locale]/admin/login` — `signIn`/`signOut` server actions in `admin/login/actions.ts`
  - Logout button in admin header
  - Admin dashboard stub at `/[locale]/admin`

- **Subcategory pages built** — DB-driven dynamic routes under all 3 category families:
  - `src/app/[locale]/chemicals/[subcategory]/page.tsx`
  - `src/app/[locale]/glassware/[subcategory]/page.tsx`
  - `src/app/[locale]/lab-equipment/[subcategory]/page.tsx`
  - Shared `src/components/ProductGrid.tsx` — product card grid (server)
  - Shared `src/components/CategoryChips.tsx` — chip nav with active state (server)
  - `src/lib/supabase/queries.ts` — `getCategoryBySlug`, `getChildCategories`, `getProductsByCategory`
  - `src/lib/categoryRoutes.ts` — slug config: `chimie` / `verrerie` / `equipements`
  - 404 on unknown slugs; parent_id guard against URL manipulation

- **Product detail pages built** — full product pages with gallery, variants, quote modal:
  - `src/app/[locale]/[family]/[subcategory]/[product]/page.tsx` × 3 — product under subcategory
  - `src/app/[locale]/[family]/[subcategory]/page.tsx` × 3 — now also handles product slugs directly under parent
  - `src/components/ProductDetailPage.tsx` — server component: gallery, info, trust badges, tabs, related grid
  - `src/components/QuoteModal.tsx` — client island: modal overlay + quote form
  - `src/app/actions/quote.ts` — `submitQuote` server action (MVP: console log)
  - `src/lib/supabase/queries.ts` — added `getProductBySlug`, `getRelatedProducts`, re-exports `ProductWithVariants`
  - CSS: modal + product detail styles appended to `globals.css`
  - Cards in ProductGrid now link to product pages via `basePath` prop

## Competitor research (2026-07-16)
- Built `equipment/scrape_competitor_catalog.py` — scrapes scientificlabs.co.uk product data (JSON-LD: name, brand, SKU, price, description, specs, image URL) via fresh-context-per-request Playwright (bypasses Cloudflare bot detection; user authorized fingerprint spoofing)
- Ran curated scrape: 83 categories (65 equipment + 18 chemicals), 10 products each → **758 products** in `research/competitor-scrape/20260716-001332/products.{json,csv}` (gitignored, reference-only)
- Descriptions are competitor's raw English text — must be rewritten in French before publishing (copyright). Images are competitor-hosted — user explicitly authorized re-hosting them into our own bucket as a placeholder, to be swapped for real/licensed photos later.
- **Pilot batch imported (2026-07-16)** — "Autoclaves" category (slug `autoclaves`, under `equipements`) + 10 products, French names/descriptions written from scratch (inspired by scraped specs, not translated verbatim), prices converted GBP→MAD at ~12.5 rate (adjust before go-live), images re-hosted into `product-images` bucket under `autoclaves/<sku>.jpg`.
  - `equipment/fetch_autoclave_images.py` — downloads product images via Playwright fresh-context (Cloudflare blocks bare fetch on image URLs too)
  - `app/scripts/import-autoclaves.mjs` — idempotent import script (category + products + variants + images), reusable pattern for next categories
- **Generalized the pipeline (2026-07-17)** — `app/scripts/import-category.mjs` + `equipment/fetch_category_images.py` now take a category slug arg, reading `equipment/data/<slug>.json`. Replaces the one-off autoclaves scripts for all future categories.
- **Balances + Bains (baths) live (2026-07-17)** — 20 products confirmed active in prod Supabase (`balances` slug, `bains` slug). FR copy was already written in `equipment/data/{balances,baths}.json`; ran image fetch + import to close out the pipeline.
- **10 more equipment categories live (2026-07-17)** — biological-safety-cabinets, block-heaters, centrifuges, chillers, colony-counters, colorimeters, conductivity-meters, cryostats, drying-cabinets, freeze-dryers. FR copy written by 10 parallel subagents from raw scrape data (rewritten, not translated), images fetched via `fetch_category_images.py`, imported via `import-category.mjs`. 98 products live (2 colorimeter SKUs skipped — source images hosted on api.sigmaaldrich.com consistently time out).
  - Hardened both pipeline scripts: `fetch_category_images.py` now catches per-image errors and continues instead of crashing the whole batch; `import-category.mjs` now skips a product gracefully (logs it) if its image was never fetched, instead of throwing.
- **Product image display fixed (2026-07-17)** — `.product-card .pimg img` and `.pd-thumb img` were `object-fit: cover` in a fixed-height box, cropping/zooming into the (mostly square, white-bg) competitor product photos. Changed to `object-fit: contain` + padding so the whole product shows.
- **10 more equipment categories live (2026-07-17, batch 2)** — furnaces, fume-cupboards, glass-washers, glove-boxes, homogenisers, hotplates, hydrometers, hygrometers, ice-machines, incubators. 100 products imported cleanly (no skips).
  - Fixed a real bug hit mid-batch: 3 homogeniser SKUs contain `/` (e.g. `GS/2`), which broke local image file paths (treated as a subdirectory). Both `fetch_category_images.py` and `import-category.mjs` now sanitize `/` → `-` for filenames/storage paths while keeping the real SKU in the DB (`safeSku()` helper in the import script).
- **9 more equipment categories live (2026-07-17, batch 3)** — density-meters, dissolved-oxygen-meters, electroporators, flame-photometers, laminar-flow-cabinets, melting-point-apparatus, microplate-readers, microplate-washers (DB slug `laveurs-microplaques`), microscopes. 90 products imported.
  - **gas-chromatography held back** — FR copy written (`equipment/data/gas-chromatography.json`) but all 10 source images are hosted on api.sigmaaldrich.com, which is unreachable/blocked from this network (100% timeout, not just flaky). Not imported. Needs an alternate image source before it can go live.
  - **2 density-meter products deactivated post-import** — `densimetre-vitesse-son-anton-paar-dma-6002-sv` and `capteur-densite-liquide-anton-paar-l-dens-2300` had `price_gbp: "0.00"` in the *source scrape itself* (likely "price on application" items scraped as 0, not a copy-writing error). Set `is_active: false` rather than leave two high-end instruments showing as free. Need real pricing before reactivating.
- **9 more equipment categories live (2026-07-17, batch 4)** — microtomes, mixers, multichannel-meters, ovens, ph-meters, pipettes, refractometers, refrigeration, rotary-evaporators. 68 products imported cleanly (FR copy already existed in `equipment/data/`, pipeline run: fetch-images → import-category.mjs).
  - **rheometers category imported but fully deactivated** — all 10 products (interchangeable/disposable measuring plates for a rheometer, not full instruments) had `price_gbp: 0` in the source scrape (price-on-application), same issue as density-meters. Ran `app/scripts/deactivate-rheometers.mjs` to set `is_active: false` on all 10. Needs real pricing before reactivating.
- Next: ~43 categories remain from the 758-product scrape (`research/competitor-scrape/20260716-001332/products.csv`), plus gas-chromatography pending an image fix — repeat pattern per category (write FR copy → `equipment/data/<slug>.json` → fetch-images → import-category.mjs).
- Known gap: 2 colorimeter products (SKU 1736320001, 1736350001) have FR copy + variant/price data written but were never imported — no image source works (same api.sigmaaldrich.com blocker as gas-chromatography). Either find alternate image or write them off.

## Blocking / not yet done
- Auth guard implemented — Supabase email+password via proxy.ts session check ✅
- No CMI integration
- No auth flow (admin vs customer)
- Law 09-08 compliance note not yet added to `compliance/regulatory-track.md`

## Next session: start here

1. **[URGENT] Implement product visibility fix** — spec approved at `docs/superpowers/specs/2026-06-21-product-visibility-fix-design.md`
   - Invoke `superpowers:writing-plans` first to generate implementation plan
   - Then invoke `superpowers:executing-plans` or implement directly
   - Root cause: products assigned to parent categories don't show when child categories exist; also admin category dropdown is flat (no hierarchy)
   - 11 files, no schema changes — see spec for full file list and exact changes
2. **[READY] Product card redesign** — plan at `docs/superpowers/plans/2026-06-21-product-card-redesign.md`
   - Invoke `superpowers:executing-plans` or `superpowers:subagent-driven-development`
   - **Task 1 is manual**: run SQL migration in Supabase dashboard before anything else
   - 6 tasks: DB migration → types → CSS → ProductGrid → admin form → actions
3. **[DONE] Product detail page** — implemented 2026-06-21, branch `worktree-feature+product-detail-page`, needs smoke test + merge
   - Task 8 (manual smoke test) still pending — start dev server and verify product detail pages render
4. Checkout / quote flow (CMI + COD)
5. Add compliance note to `compliance/regulatory-track.md` (Law 09-08 PII retention)

## Known tech debt
- Admin routes hardcoded to `/fr/` locale — acceptable for French-only MVP, must grep-replace before adding any second locale
- `updateProduct` deletes + re-inserts all variants on save (no FK-safe upsert) — risk if `order_items.variant_id` references are added
- No cycle detection in `updateCategory` parent_id — UI prevents immediate self-loop but not deeper chains
