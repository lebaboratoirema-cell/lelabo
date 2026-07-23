# Project State

**Status:** Active development — schema designed, migration ready to run
**Last updated:** 2026-07-18

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
  - `src/app/actions/quote.ts` — `submitQuote` server action, wired to Airtable + Resend (2026-07-18, see below)
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
- **Product specifications support added (2026-07-17)** — scraper already captures `specs_raw` (JSON-LD) but pipeline was dropping it; DB/UI had no place to show specs. Added:
  - `supabase/migrations/004_product_specifications.sql` — `products.specifications jsonb` — **[MANUAL] run this in Supabase dashboard before next import**
  - `app/src/types/database.ts` — `Product.specifications: Record<string,string> | null`
  - `app/scripts/import-category.mjs` — reads `p.specs_fr` from `equipment/data/<slug>.json` into `specifications`
  - `ProductDetailPage.tsx` + `globals.css` — renders "Caractéristiques techniques" table under the description tab when specs exist
  - Scope decision: forward-only, no backfill of the 43 already-imported categories (~700 products)
  - **Going forward**: when writing `equipment/data/<slug>.json` for a new category, FR copywriters must also translate `specs_raw` → `specs_fr: {"Clé": "Valeur", ...}` per product (optional field, product still imports fine without it)
- **First specs-enabled batch live (2026-07-17)** — thermometers + titrators (20 products, all with `specifications` populated and confirmed rendering via `products.select('specifications')`). Added `app/scripts/run-migration.mjs` (via new `pg` devDependency) since no Supabase CLI/psql was available locally to run migration 004 — reusable for future raw-SQL migrations.
- **11 more equipment categories live (2026-07-17, batch 5)** — hplc, lc-ms, mass-spectrometry-supplies, nmr, osmometers, pumps, sieve-shakers, spectrophotometers, stirrers, turbidity-meters, viscometers. FR copy written by 11 parallel subagents from raw scrape data. 91 products imported, 16 skipped (all Sigma-Aldrich-hosted images: 9 in mass-spectrometry-supplies, 7 in nmr — same api.sigmaaldrich.com timeout blocker as gas-chromatography/colorimeters).
  - Skipped these low-count remaining categories as not worth standalone pages (1-3 scraped products each): calorimeters, cell-density-meters, dumas-analysers, ion-meters, lplc, polarimeters, power-supply-units, uv-crosslinkers.
  - `nmr` category is actually stable-isotope reagents for NMR (not instruments) — named "Isotopes stables pour RMN". `osmometers` category is Gonotec Osmomat consumables/accessories, not standalone osmometer units.
  - **VIS1002 deactivated (2026-07-17)** — Anton Paar Lovis 2001 microviscometer was imported at 0 MAD (price-on-application), ran `app/scripts/deactivate-vis1002.mjs`, confirmed `is_active: false`.
  - `spectrophotometers` has 2 pairs of same-instrument-different-price listings (promo vs standard) kept as separate SKUs — worth a look before go-live.
- **17 chemicals categories live (2026-07-17, batch 6)** — biomolecules, bioreagents, antibiotics, antibodies, enzymes, enzyme-inhibitors, enzyme-substrates, amino-acids, nucleotides-nucleosides, proteins-and-peptides, oils-and-greases, biocides, labelling-reagents, cell-solutions, density-gradient-centrifugation-media, microbiology-media, genomic-dna — first chemicals-family import (parent slug `chimie`), FR copy written by 17 parallel subagents from raw scrape data.
  - **Chemicals scrape data is heavily Sigma-Aldrich sourced — most images blocked by the api.sigmaaldrich.com timeout issue.** Only 67/169 products imported; 5 categories (biomolecules, antibodies, enzyme-inhibitors, enzyme-substrates, amino-acids) imported **0 products** — category row exists in DB but empty, needs an alternate image source to ever populate. Full/near-full coverage: oils-and-greases (10/10), labelling-reagents (10/10), microbiology-media (10/10), genomic-dna (10/10), cell-solutions (10/10), density-gradient-centrifugation-media (7/9).
  - **cell-solutions deactivated (2026-07-17)** — all 10 products (Charles River immunology antigens, price-on-application) deactivated via `app/scripts/deactivate-cell-solutions.mjs`, confirmed.
  - Some categories had sparse/null source descriptions — copy was written from general product knowledge (named cell lines, known compounds) rather than rewritten from source text. Worth a light fact-check pass before go-live: `biocides.json` CAS numbers, `genomic-dna.json` cell-line descriptions, `lc-ms.json` specs (from equipment batch 5, same issue).
- Next: gas-chromatography (equipment, blocked on images) + the 5 empty chemicals categories above both need an alternate image source before they can ever go live — same root blocker (api.sigmaaldrich.com unreachable from this network). Otherwise equipment + this chemicals batch cover the bulk of the scraped catalog (758 products total; ~455 live now across ~53 categories).
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

## Humeau.com scrape pilot (2026-07-18)
- User asked to scrape https://www.humeau.com/petit-materiel-verrerie-plastique.html
- robots.txt disallows ClaudeBot/anthropic-ai explicitly. User authorized override.
- Site is plain server-rendered Magento HTML, no bot-detection challenge — new pipeline `equipment/scrape_humeau_catalog.py` uses plain `requests` (no Playwright needed), pulls JSON-LD Product schema + spec table per product.
- Category has 68 subcategories total (only `becher` piloted so far).
- **Pilot batch imported** — `becher` subcategory (15 products, slug `becher` under `verrerie`), FR copy written from scratch (facts only, not translated/copied from source), prices EUR→MAD.
- `app/scripts/import-category.mjs` generalized to accept `price_eur` (rate 10.8, adjust before go-live) alongside existing `price_gbp` (rate 12.5).
- **10 more humeau subcategories live (2026-07-18, batch 2)** — ampoule-a-decanter, ballon, entonnoirs, eprouvette, fiole, humeau-pipette (DB slug `pipettes-verre-graduees`), humeau-tube (DB slug `tubes-essai-centrifugation`), burette, bouchon, cuve-spectrophotometre. 150 products, all imported cleanly, no skips. FR copy written by 10 parallel subagents from raw scrape data (facts rewritten, not translated/copied from source). `humeau-pipette`/`humeau-tube` filenames avoid slug collisions with existing scientificlabs-sourced `pipettes.json`.
- Next: 57 more humeau subcategories available if user wants to continue this source (becs, bille, bistouri, boite, bonbonne, butyrometre, chariot, cones, consistometre, creusets, cristallisoir-capsule, cuvette-bac-plateau, densimetre-areometre, dessiccateur, egouttoirs, essuyage-lingettes, flacon (+2 subs), fourniture-usage-general (+5 subs), gabarits, glaciere-accumulateur-de-froid, goupillon, jarre-anaerobie, lame-lamelle-microscopie (+1 sub), louche, manometre, montage-verrerie (+3 subs), mortier, panier, petit-materiel-d-agitation, pied-a-coulisse, pince, pissette, plateau, poids-de-calibration, portoir, seau, seringue, sonde-de-prelevement, spatule-cuillere, thermometre, vase-sabot-nacelle-pesee, verre-de-montre — see equipment/scrape_humeau_catalog.py docstring for usage).

## Logo + devis form wired (2026-07-18)
- **Site logo replaced** — `app/public/images/logo.jpeg` + `logo-real.jpeg` now the new hexagon-flask icon mark, cropped from user-supplied `LELABO_4K_3840x2880.webp` (Header.tsx and SiteFooter.tsx both reference the same file, no code changes needed).
- **Devis (quote) form now actually delivers requests** — was `console.log` only, requests were lost. `submitQuote` (`app/src/app/actions/quote.ts`) now:
  - Saves each request to Airtable, base `appwsIecObh127x8H` ("Untitled Base" workspace, account `lebaboratoire.ma@gmail.com`), table "Devis" (`tbll4YgGEmxJ45Tl4`) — fields: Nom, Email, Telephone, Produit, Variante, Message, Statut, Date.
  - Sends an email notification via Resend to `lebaboratoire.ma@gmail.com`, sender `onboarding@resend.dev` (Resend's shared test domain — works now, but verify a real domain in Resend before high volume/production).
  - Added pinned `resend@6.17.2` dependency.
  - Keys live in `app/.env.local` only (`RESEND_API_KEY`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_DEVIS_TABLE`, `DEVIS_NOTIFY_EMAIL`); `app/.env.example` updated with placeholders.
  - Both integrations tested end-to-end live (test record written then deleted, test email sent) — confirmed working 2026-07-18.
  - Note: an earlier Airtable base ("Leads", `appGCNnKpczLu3kV0`) turned out to belong to a *different* Airtable account than `lebaboratoire.ma@gmail.com` — abandoned, do not reuse.

## Humeau.com full-catalog push — IN PROGRESS (2026-07-19)
User asked to make all scraped humeau products live (chose "remaining 57/80 subcategories" scope over reactivating deactivated items or fixing sigma-aldrich image blockers).

- **Scraped**: all 80 remaining humeau subcategories under petit-materiel-verrerie-plastique (11 were already live from 2026-07-18 pilot). Discovered 4 of the "68 subcategories" mentioned in the earlier note are actually parent/index pages with nested sub-subcategories (flacon: 8 subs, fourniture-usage-general: 14 subs, lame-lamelle-microscopie: 4 subs, montage-verrerie: 15 subs) — flattened these into their own leaf categories, all still under DB parent `verrerie`.
- Raw scrape: 972 products written to `research/competitor-scrape-humeau/20260719-003453/products.json` (+ .csv). Images are 970/972 self-hosted on humeau.com (no sigma-aldrich-style blocker this time — good). Only 37 products have price=0 (on-application) across the whole set.
- **FR copy writing**: dispatched 8 parallel subagents (10 subcategories each) to write `equipment/data/<slug>.json` from the raw scrape (rewritten French copy, not copied verbatim — copyright). **6 of 8 batches hit a Claude session-limit error mid-run** (resets 1am Africa/Casablanca) and only partially completed. Dispatched 3 replacement agents for the ~33 missing subcategories (retry batches A/B/C) — **status when this note was written: retry agents still running / not yet confirmed complete.**
- **Full db_slug -> source_subcategory_slug mapping** (needed if any file is still missing or needs re-running) lives only in this conversation's tool calls, not written to disk anywhere — if resuming from scratch, re-derive by listing `equipment/data/*.json` against the 80-item list below and re-scraping/re-mapping only what's missing:
  - Flat leaves (39): barometre-pluviometre-psychrometre, becs, bille, bistouri, boite, bonbonne, butyrometre, chariot, cones, consistometre, creusets, cristallisoir-capsule, cuvette-bac-plateau, densimetre-areometre, dessiccateur, egouttoirs, essuyage-lingettes, gabarits, glaciere-accumulateur-de-froid, goupillon, jarre-anaerobie, louche, manometre, mortier, panier, petit-materiel-d-agitation, pied-a-coulisse, pince, pissette, plateau, poids-de-calibration, portoir, seau, seringue, sonde-de-prelevement, spatule-cuillere, thermometre, vase-sabot-nacelle-pesee, verre-de-montre
  - flacon/* -> flacon-aluminium, flacon-de-culture, flacon-laveur, flacon-mesureur-a-renversement, flacon-plastique, flacon-pulverisateur, flacon-pycnometre, flacon-verre
  - fourniture-usage-general/* -> cahier-de-laboratoire, chronometre, ciseaux, coton, coupe-tube, couteau, crayon-de-laboratoire, etiquettes, loupe, minuterie, papier-d-emballage, papier-pour-imprimante, parafilm, piles
  - lame-lamelle-microscopie/* -> accessoires-lame-lamelle, cellule-numeration-lame-lamelle, couvre-objet-lame-lamelle, porte-objet-lame-lamelle
  - montage-verrerie/* -> allonge-montage-verrerie, anneau-de-lestage, collier-de-serrage, elevateur-de-laboratoire, extracteur-soxhlet, montage-verrerie-refrigerant, noix-de-serrage, raccord-plastique-montage-verrerie, raccord-verre-montage-verrerie, raccord-montage-verrerie (source slug is exactly `montage-verrerie/raccord`, must be exact-matched not substring-matched), robinet-montage-verrerie, support-statif-montage-verrerie, trompe-a-eau-montage-verrerie, tube-montage-verrerie, tuyau-montage-verrerie

### DONE (2026-07-19) — full push completed
1. Found 16/80 FR-copy files missing (checked against the mapping list) — re-scraped their raw data (source data was actually still intact in `research/competitor-scrape-humeau/20260719-003453/`, no need for the 2 extra scrape runs done first) and dispatched 3 parallel subagents to write the missing `equipment/data/<slug>.json` files. All 80 confirmed present/non-empty (2 use filenames `humeau-pipette.json`/`humeau-tube.json` per the earlier collision-avoidance note).
2. Ran fetch-images + import sequentially for all 80 new slugs (`/tmp/run_humeau_pipeline.sh`, ~35 min). 620 products imported this run.
3. **Final live counts confirmed via Supabase**: **1722 total products, 1699 active, 177 categories** (was 165 categories / ~455 products before this push).
4. **16 products failed to import** — `products_slug_key` collisions (their generated slug already matches an existing product from an unrelated earlier category, e.g. generic names like "capsule à évaporation" or "pince" overlapping with prior scientificlabs.co.uk imports). SKUs: 200113, 205377, 207364, 215219, 218439, 219522, 219644, 219687, 219691, 220686, 221779, 257564, 259100, 259633, 260615, 261005 — spread one-per-category across cristallisoir-capsule, cuvette-bac-plateau, densimetre-areometre, goupillon, petit-materiel-d-agitation, pince, seau, flacon-aluminium/flacon-de-culture, crayon-de-laboratoire, etiquettes, cellule-numeration-lame-lamelle, couvre-objet-lame-lamelle, porte-objet-lame-lamelle, support-statif-montage-verrerie, tuyau-montage-verrerie, accessoires-lame-lamelle.
   - **Not yet fixed.** `app/scripts/import-category.mjs`'s `getOrCreateCategory`/product-insert flow doesn't disambiguate slugs on collision (no `-2` suffix fallback). Follow-up: either give the 16 products a unique slug manually and re-run import, or add collision-retry logic to the import script.
5. One data-quality flag from copywriting: SKU 241029 ("VACUOMETRE A POINÇON EN ACIER") was scraped under the `montage-verrerie/tuyau-pour-montage-verrerie` (tubing) subcategory on humeau.com but is actually a vacuum gauge — likely mis-tagged at the source. Currently imported under `tuyau-montage-verrerie`; consider moving to a more fitting category later.
6. Spot-check of new product pages (images/specs/pricing) not yet done this session — recommended before considering this batch fully go-live-ready.

## Site down incident + PageSpeed fixes — IN PROGRESS (2026-07-22)
- **User reported prod down** ("This page couldn't load"). Diagnosed: NOT a Vercel issue — `lelaboratoire.ma` DNS actually points to Hostinger's CDN (`hstgr.net`), Vercel project `lelaboratoire` is a stale/unused deployment. Real host: Hostinger Node.js hosting, domain `lelaboratoire.ma`, user `u977616691`, root `/home/u977616691/domains/lelaboratoire.ma/public_html`, deployed via Hostinger's git-connected Node.js build (`app/` root dir, `build:standalone` script, Node 24).
- Restarted Node app + cleared Hostinger cache — server itself confirmed healthy from multiple vantage points (WebFetch, curl, 5x repeated checks all 200 OK).
- **User's actual symptom**: fails in ALL browsers (Chrome/Edge/Firefox), ALL networks (wifi+data), 2+ different devices, incognito — shows "Checking your browser" then "This page couldn't load". This is Hostinger's CDN (`hcdn`) bot-protection/JS-challenge screen, not the app. **Not yet resolved** — no API/MCP tool exposes this toggle; must be disabled/lowered manually in hPanel (Websites → lelaboratoire.ma → CDN/Security → Bot Protection or "Under Attack Mode"). User was navigating there when we switched focus to PageSpeed; **still needs to be found and turned down/off, then retest in Edge specifically** (last confirmed-failing browser).
- Toggled `hosting_toggleWebsiteCacheV1` off then back on + re-cleared cache mid-session (troubleshooting the above, didn't fix it — reverted to enabled).
- **Found and fixed separately**: static images under `app/public/images/*` were serving with NO `Cache-Control` header despite `next.config.ts` having a `headers()` rule for `/images/:path*`. Root cause: Next.js `output: 'standalone'` mode's minimal `server.js` serves `/public` files via a bare static handler that skips custom `headers()` entirely (confirmed via bundled `node_modules/next/dist/docs/.../output.md` — "these should ideally be handled by a CDN instead"). Only `.next/static` chunks get Next's hardcoded immutable caching; plain `/public` assets don't.
  - **Fix applied**: converted the PageSpeed-flagged instances from `<img>` to `next/image` (routes through `/_next/image`, which the standalone server's full pipeline does handle, so gets proper cache headers + auto responsive sizing) — `AboutSection.tsx` (main-img, float-img), `PromoSection.tsx` (both panel bg images), `HeroSlider.tsx` (slide bg, added `priority` on first slide).
  - Also cut Supabase thumbnail request size in `ProductCarousel.tsx`: `width=400` → `width=220` (actual rendered width ~110px, was over-fetching).
  - **Deliberately left untouched** (not flagged in the PageSpeed run given): `ProductGrid.tsx`'s own `width=400` param (different/larger card context), the 15KB Next-internal CSS chunk render-blocking finding, old-JS/core-js polyfill finding (both are Next.js build internals, not app config — no browserslist override in this repo).
  - **Typecheck passed** (`npx tsc --noEmit`) after edits. **Not yet built, not yet committed, not yet deployed.**
- **next/image fixes committed + pushed (2026-07-22, commit `3ab1f70`)** — AboutSection/PromoSection/HeroSlider `<img>`→`next/image`, ProductCarousel thumb width 400→220. Deployed via Hostinger auto-build.
- **PageSpeed re-run after deploy: same score, no change.** Root cause confirmed (2026-07-22) — **not a code issue.**
  - Ran Lighthouse locally (same engine PSI uses) against `https://lelaboratoire.ma/fr`: `runtimeError: ERRORED_DOCUMENT_REQUEST`, **"Status code: 403"** — real headless Chrome is blocked outright by Hostinger's `hcdn` bot-protection.
  - `curl` with a spoofed Lighthouse UA got 200 OK earlier (real page, correct headers, no challenge HTML) — but that's curl, not a real browser engine; it doesn't trigger the same fingerprint check PSI/Lighthouse's actual headless Chrome does.
  - **Conclusion: PageSpeed/Lighthouse is not measuring the app at all — it's measuring (or failing on) the CDN's bot-protection block/challenge page.** All 5 flagged audits (minify CSS/JS, unused CSS/JS, long main-thread tasks) are scored against that block response, not real page weight. This is why the score didn't move after real fixes shipped.
  - Local prod build confirmed already optimal on the app side: CSS 48K minified, largest JS chunk 224K minified, all via Turbopack prod build — nothing left to fix code-side for these audits.
- **Bot-protection resolved (2026-07-22, later same day)** — user re-ran PageSpeed, got a real (non-403) result this time: only 1 finding, render-blocking CSS chunk (`3iuqmq5of1157.css`, 15.3KiB, ~250ms, ~200ms estimated LCP saving). Confirms the earlier diagnosis was correct and the hPanel toggle got sorted.
- **Render-blocking CSS fixed (commit `2e57968`)** — enabled `experimental.inlineCss: true` in `next.config.ts` (Next 16 feature, see `node_modules/next/dist/docs/.../inlineCss.md`). Verified locally: HTML now has `<style data-precedence="next">` instead of a blocking `<link rel="stylesheet">`. Safe tradeoff here — CSS is Tailwind-only, small (15.3K), one shared bundle across every route, so per-page-load re-inlining cost is minor vs. the eliminated render-blocking request. Built + pushed.
- **"Old JavaScript" / core-js polyfill finding investigated (2026-07-22, commit `324bf79`) — confirmed unfixable in this repo.** PageSpeed flagged 18KiB of ES2019+ polyfills (`Array.at`, `flat`, `flatMap`, `Object.fromEntries`, `Object.hasOwn`, `trimStart/End`) in chunk `0injn07qfcgrb.js`.
  - Added `browserslist` field to `app/package.json` (`"defaults and supports es6-module", "maintained node versions"`) — correct hygiene, but rebuilt and confirmed **identical output hash before/after** — zero effect on this chunk.
  - Traced further: no `core-js` package anywhere in `node_modules` (checked all deps incl. Supabase/next-intl/react-markdown/resend). The chunk is Next.js's own internal framework runtime, shipped precompiled inside the `next` 16.2.9 package itself — not re-transpiled from our source, so project-level browserslist config can't reach it.
  - PageSpeed itself marks this audit **"Non noté" (not scored)** — doesn't affect the performance score. Leaving as-is; would need a Next.js version bump to possibly change, not worth chasing further.
- **Forced reflow fixed (commit `465946d`)** — PageSpeed flagged a forced layout (35ms, unattributed source). Only geometry-reading code in the app is `ProductCarousel.tsx`'s `updateEdges` (`scrollLeft`/`clientWidth`/`scrollWidth`), fired on every scroll tick right after `atStart`/`atEnd` state toggles the nav buttons' `disabled` attribute — classic same-frame write-then-read forced-layout pattern. Wrapped the read in `requestAnimationFrame` to push it past paint. Speculative fix (source was unattributed, audit unscored) but zero-risk and the only real candidate in the codebase.
- **Next session: start here**
  1. Re-run PageSpeed after latest deploy (CSS inlining + reflow fix) to confirm both are gone and see current score.
  2. Findings closed out so far: render-blocking CSS ✅, forced reflow ✅ (speculative), old-JS polyfill = confirmed unfixable/unscored Next.js internal. If PageSpeed comes back clean, this remediation round is done — ask user for next priority (checkout/CMI flow, compliance note, etc. — see Blocking section above).

## GEO (AI-citation) audit + fixes — IN PROGRESS (2026-07-23)
User asked to optimize the site to be indexed/cited by AI answer engines (ChatGPT, Perplexity, AI Overviews).

**Audit findings**: robots.txt fine (no AI-bot blocks). Zero JSON-LD anywhere except blog. Category pages had no lead paragraph/FAQ/comparison content. Undated content. Promotional tone on homepage. Competitors identified: dataworld.ma, equipement-labo.com, equipement-laboratoire.com, flaster.ma, assistec.ma, tradetec.ma, estlab.ma.

**Done + deployed (commits cf014dd, baa3362, 0eae1e9)**:
- `src/lib/jsonLd.ts` — shared `safeJsonLd` + `breadcrumbListJsonLd` helpers
- `Product` JSON-LD on all product pages (via shared `ProductDetailPage.tsx`) — name/description/image/sku/brand/url, **deliberately no `offers`/price** since UI shows "Prix sur devis" not a number (schema must match what's displayed)
- `BreadcrumbList` JSON-LD on all product pages + all category pages (subcategory level + family-root level)
- Category pages (172/177 already had a `description` in DB, just never rendered) now show it as a lead paragraph — wired into all 4 `[subcategory]/page.tsx` templates
- Wrote the one meaningfully-sized missing category description (`outillage-verrerie`, 165 products)
- Family-root pages (lab-equipment, produits-chimiques, petit-outillage) got new `description` field in `CATEGORY_ROUTE_META` + lead paragraph + BreadcrumbList

**Bonus bug found + fixed while doing this**: `/fr/glassware` has a permanent redirect to `/fr/petit-outillage` in `next.config.ts` — the entire `src/app/[locale]/glassware/**` route tree was dead/unreachable code (Next matches redirects before page routes). Root cause: DB category `verrerie` has 0 children; every glassware-family subcategory from the humeau scrape is actually parented under `petit-outillage`. Deleted the dead route tree, removed `glassware` from `CATEGORY_ROUTE_SLUGS`/`SEGMENT`/`META` (which also fixed `sitemap.ts` — was emitting dead `/glassware` URLs for both locales + every city page), and fixed admin product create/update/delete actions which were calling `revalidatePath('/fr/glassware')` (dead) instead of `/fr/petit-outillage` (the actual largest family — was never being cache-revalidated on product changes).

**Verified live**: curled a real product page post-deploy, confirmed both `Product` and `BreadcrumbList` JSON-LD blocks present and correct.

**FAQ blocks per category — infra + pilot MERGED + DEPLOYED (2026-07-23, commits 350a6ed..3a65d19, pushed to origin/master)**:
- Plan: `docs/superpowers/plans/2026-07-23-category-faq-blocks.md` (8 tasks, executed via subagent-driven-development)
- `categories.faq jsonb` column added (migration `009_category_faq.sql` — applied via Supabase MCP `apply_migration`, not `run-migration.mjs`: that script's `DATABASE_URL` points at `db.<ref>.supabase.co`, which is IPv6-only and unreachable from this dev network; the MCP tool and the REST-API-based `update-category-faq.mjs` script both work fine since they don't hit that host)
- `Category.faq: CategoryFaqItem[] | null` type, `faqPageJsonLd()` helper in `src/lib/jsonLd.ts`, `CategoryFaq` server component (native `<details>/<summary>`, no JS needed) — all wired into the 3 subcategory templates (`lab-equipment`, `produits-chimiques`, `petit-outillage`), conditional on `child.faq` being non-null so it's inert everywhere content hasn't been written yet
- `app/scripts/update-category-faq.mjs` — content loader, reads `equipment/data/faq/<slug>.json`, pushes to DB by slug (per-slug try/catch on read/parse errors, so one bad file in a batch doesn't abort the rest)
- **Pilot batch live in prod**: 5 categories, all under `petit-outillage` family (tied at 15 products each) — `verre-de-montre`, `bille`, `boite`, `bistouri`, `vase-sabot-nacelle-pesee`. 4 grounded Q&A pairs each, written from real product specs in DB. Verified live: `curl https://lelaboratoire.ma/fr/petit-outillage/verre-de-montre | grep FAQPage` → present.
- **Known gap**: pilot only exercised the `petit-outillage` route family end-to-end. `lab-equipment` and `produits-chimiques` templates got the identical code change and typecheck passed, but neither has been render-verified with real FAQ data on a live category — do that during the next content batch.
- **Next batch**: ~172 categories remain, batch in groups of ~15 via parallel subagents (same pattern as the humeau FR-copy rollout), see Task 8 in the plan doc for the exact runbook query + process.

**Homepage promotional-tone cleanup — DONE (2026-07-23, commit b84b97b)**: stripped unverified superlatives flagged in the GEO audit ("meilleur", "large sélection/gamme", "premium", "les plus prisés") from `HeroSlider.tsx`, `PromoSection.tsx`, `ServicesSection.tsx`, `BrandsSection.tsx`, `FeaturedProducts.tsx`. Replaced with factual claims where possible (e.g. "Plus de 1700 références" instead of "gamme premium"). Grepped `app/src/components` afterward for the same pattern set — clean. Not yet deployed (committed to master, not yet pushed — bundled with next push).

**Next session: start here**
1. Push commit `b84b97b` to origin (homepage tone fix — not yet deployed).
2. Continue the FAQ content rollout in batches of ~15 categories (see Task 8 runbook in the plan doc), including the deferred `lab-equipment`/`produits-chimiques` live spot-check.
3. Query test set for actual AI-citation measurement — never run. I (Claude) can't query ChatGPT/Perplexity live; either hand the user the ~15-query list to run manually, or route to `ai-visibility-monitoring` skill for automated tracking. Competitor list above is ready to use.
4. "Prix sur devis" stays as-is — user explicitly confirmed, don't revisit without being asked.
5. Unrelated open items from before this GEO work are still open — see "Blocking / not yet done" and "PageSpeed" sections above.

## Servilab.fr scrape attempt (2026-07-18) — blocked, dropped
- User asked to scrape https://www.servilab.fr/catalogue/consommables
- robots.txt explicitly disallows ClaudeBot/GPTBot/CCBot (Content-Signal ai-train=no). Flagged to user, user chose to proceed anyway.
- Site runs Cloudflare **Turnstile** (interactive managed challenge), harder than scientificlabs.co.uk's plain JS challenge. Headless + playwright-stealth + fingerprint spoofing failed after 8 retries/24s. Non-headless also failed (browser window not usable for manual solve in this shell environment — closed/timed out on its own).
- User decided to drop servilab.fr, resume the existing scientificlabs.co.uk pipeline instead.
- **Closed 2 remaining full-size gaps in the scientificlabs scrape**: thermal-cyclers (10 products) + water-purification (10 products) — FR copy written from raw scrape, images fetched, imported. Both new categories under `equipements`.
- Remaining known gaps unchanged: gas-chromatography + 5 empty chemicals categories (all blocked on api.sigmaaldrich.com image timeouts), 2 unimported colorimeter SKUs, 8 low-count (1-3 product) categories intentionally skipped as not worth standalone pages.
