# Subcategory Pages — Design Spec

**Date:** 2026-06-20  
**Status:** Approved

## Problem

The 3 public category pages (`/fr/chemicals`, `/fr/glassware`, `/fr/lab-equipment`) have static filter chips that do nothing. Users expect clicking "Solvants" or "Réactifs" to navigate to a page showing only those products.

## Solution

Add dynamic subcategory routes under each existing category page. Subcategories and products come from the Supabase database. The parent category pages become DB-driven too.

---

## Routing

```
/fr/chemicals                    → parent page (all products in child categories)
/fr/chemicals/[subcategory]      → products for that subcategory only

/fr/glassware                    → parent page
/fr/glassware/[subcategory]      → subcategory page

/fr/lab-equipment                → parent page
/fr/lab-equipment/[subcategory]  → subcategory page
```

The `[subcategory]` segment matches the category `slug` column in the DB.

---

## Database Queries

New file: `app/src/lib/supabase/queries.ts`

Three functions used across pages:

```ts
getCategoryBySlug(slug: string): Promise<Category | null>
getChildCategories(parentId: string): Promise<Category[]>
getProductsByCategory(categoryId: string): Promise<Product[]>
```

All use the server-side Supabase client (`src/lib/supabase/server.ts`).

---

## Parent Category Pages (`/fr/chemicals`, etc.)

Each parent page maps to a top-level category slug from the DB. The mapping is defined once in a single config constant (not scattered across page files):

```ts
// app/src/lib/categoryRoutes.ts
export const CATEGORY_ROUTE_SLUGS = {
  chemicals: 'TBD_verify_in_db',
  glassware: 'TBD_verify_in_db',
  'lab-equipment': 'TBD_verify_in_db',
} as const
```

**Implementation prerequisite:** Before coding, query `SELECT slug FROM categories WHERE parent_id IS NULL` in Supabase to get the actual slugs, then fill in the config.

**Render logic:**
1. `getCategoryBySlug(topLevelSlug)` — get parent category
2. `getChildCategories(parent.id)` — get child categories for chip links
3. For each child, `getProductsByCategory(child.id)` — fetch all products, merge
4. Render chip links: `<a href="/fr/chemicals/{child.slug}">` for each child + "Tous" chip active

**If no child categories exist:** show products directly under the parent category.

---

## Subcategory Pages (`/fr/chemicals/[subcategory]`)

File: `app/src/app/[locale]/chemicals/[subcategory]/page.tsx` (same pattern for glassware, lab-equipment)

**Render logic:**
1. `getCategoryBySlug(params.subcategory)` — get child category
2. Validate `child.parent_id` matches the expected parent (guard against URL manipulation)
3. `getChildCategories(parent.id)` — fetch siblings for chip navigation
4. `getProductsByCategory(child.id)` — fetch products
5. Render breadcrumb: Accueil / Chimie / Solvants
6. Render chip bar with current subcategory highlighted, others as links
7. Render product grid (same layout as parent page)

**404 handling:** if slug not found or parent mismatch → `notFound()`

---

## Product Grid Component

Extract the product grid JSX from the existing category pages into a shared server component:

`app/src/components/ProductGrid.tsx`

Props: `products: Product[]`

Avoids duplicating grid markup across 6 pages.

---

## Chips Component

Extract chip bar into a shared client component (needs to know which chip is active):

`app/src/components/CategoryChips.tsx`

Props:
```ts
{
  chips: { label: string; href: string }[]
  activeSlug: string | null   // null = "Tous"
  allHref: string             // href for "Tous" chip
}
```

---

## Empty State

If `getProductsByCategory` returns 0 products: show a simple message ("Aucun produit dans cette catégorie pour l'instant.") instead of an empty grid.

---

## Scope

Files created:
- `app/src/lib/supabase/queries.ts`
- `app/src/components/ProductGrid.tsx`
- `app/src/components/CategoryChips.tsx`
- `app/src/app/[locale]/chemicals/[subcategory]/page.tsx`
- `app/src/app/[locale]/glassware/[subcategory]/page.tsx`
- `app/src/app/[locale]/lab-equipment/[subcategory]/page.tsx`

Files modified:
- `app/src/app/[locale]/chemicals/page.tsx` — remove static array, wire DB
- `app/src/app/[locale]/glassware/page.tsx` — same
- `app/src/app/[locale]/lab-equipment/page.tsx` — same

---

## Out of scope

- Auth/admin changes
- Search or pagination (can add later)
- Product detail pages
- Changing top-level URL structure
