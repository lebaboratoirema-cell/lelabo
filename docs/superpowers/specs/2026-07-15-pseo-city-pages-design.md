# pSEO: Category × City Pages — Design

## Purpose

Phase 1 of a broader pSEO effort (later phases: use-case pages, glossary pages, comparison pages — out of scope here). Generate 40 landing pages targeting "{category} à {ville}" search intent across Morocco's top 10 commercial cities, for the existing 4 top-level product categories.

## Scope

- **Categories** (existing top-level routes, unchanged): chimie (chemicals), verrerie (glassware), équipements (lab-equipment), petit-outillage
- **Cities** (10, static list): Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Meknès, Oujda, Kénitra, Tétouan
- **Page count**: 4 × 10 = 40 unique URLs (× 2 locales for routing, fr copy reused for en — see Assumptions)
- Product comparison pages, use-case pages, and glossary pages are explicitly deferred to later phases.

## URL Structure

`/[locale]/{categoryRouteSlug}/villes/[citySlug]`

Example: `/fr/verrerie/villes/casablanca`

Uses existing `CATEGORY_ROUTE_SLUGS` from `src/lib/categoryRoutes.ts` (chimie, verrerie, equipements, petit-outillage).

## Routes / Files

One thin page file per existing category folder (matches current pattern where each category is its own top-level file rather than a dynamic `[category]` segment):

```
src/app/[locale]/chemicals/villes/[city]/page.tsx
src/app/[locale]/glassware/villes/[city]/page.tsx
src/app/[locale]/lab-equipment/villes/[city]/page.tsx
src/app/[locale]/petit-outillage/villes/[city]/page.tsx
```

Each imports and calls a shared renderer:

```
src/lib/pseo/renderCityPage.tsx  — server component fn(categoryRouteKey, citySlug) -> JSX
src/lib/pseo/cities.ts           — static city fact-block config
src/lib/pseo/cityIntro.ts        — template fn building unique intro copy + meta description
```

## Data Model

`src/lib/pseo/cities.ts` — static array, no DB/migration:

```ts
interface CityInfo {
  slug: string
  name: string
  region: string
  deliveryDays: string       // e.g. "24-48h"
  zonesServed: string[]      // e.g. ["Ain Sebaâ", "Sidi Bernoussi", "Maârif"]
}
```

10 entries, hand-written once.

## Content Generation

`buildCityIntro(categoryRouteKey, city)`:
- Picks one of 2-3 sentence-pattern variants per category (chemicals/glassware/equipment/outillage phrase differently — not just city-name mad-libs)
- Interpolates city name, region, zones served
- Returns both: (a) on-page intro paragraph, (b) a distinct ~155-char meta description string (same data, different template, so meta ≠ visible copy verbatim)

Page structure (reusing existing components):
1. Banner (existing `meta.bannerImage`/title pattern, city name appended to H1)
2. Breadcrumb: Accueil / {Category} / {City}
3. Intro paragraph (city+category specific)
4. Delivery/logistics block (new small component): deliveryDays + zonesServed list + CTA to /contact
5. `ProductGrid` — same products as parent category page (no per-city product filtering; products aren't regional, differentiation lives in surrounding content blocks)

## Internal Linking

- Parent category page (e.g. `glassware/page.tsx`) gets a new "Livraison dans votre ville" block linking to its 10 city pages.
- City pages link back to parent category page via breadcrumb.

## Metadata & Indexation

- `generateMetadata` added to each of the 4 new page files:
  - title: `{CategoryLabel} à {City} | Le Laboratoire`
  - description: from `buildCityIntro`'s meta variant
  - canonical: `https://<domain>/fr/{categoryRouteSlug}/villes/{citySlug}` (locale-aware)
- New `src/app/sitemap.ts` (none exists today): enumerates the 40 city pages × 2 locales (80 URLs) plus existing static routes (home, shop, about, contact, catalogues, blog index, 4 category pages). Dynamic content (blog posts, products) excluded — separate concern.

This is a net-new SEO capability for the site (no `generateMetadata` or sitemap exists anywhere today) — required for the city pages to be discoverable at all, not scope creep specific to this feature but a prerequisite.

## Error Handling

Unknown city slug or unknown category slug → `notFound()`, same as existing category/subcategory pages.

## Assumptions

- **English locale copy**: `en` locale renders the same French-authored intro/delivery copy (no separate English translation pass) — matches this site's fr-first content elsewhere. Revisit if user wants real EN translations later.
- City fact-block content (delivery days, zones served) is illustrative/reasonable-default text, not sourced from actual logistics data — user should review the 10 entries in `cities.ts` before publishing and correct any inaccurate delivery claims.

## Testing / Verification

No automated test suite covers page rendering in this repo. Verification plan: run dev server, manually check 2-3 sample city pages (different categories) render correctly with correct metadata, check `/sitemap.xml` output, confirm no console errors. Will run `/verify` after implementation.

## Out of Scope (later phases)

- Product comparison pages
- Use-case/application pages
- Glossary/spec pages
- Admin-editable city content (currently static config; would need new Supabase table + admin CRUD if editability is needed later)
