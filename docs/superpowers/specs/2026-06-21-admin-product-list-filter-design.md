# Admin Product List — Category/Subcategory Filter

**Date:** 2026-06-21  
**Status:** Approved

## Goal

Add category and subcategory filter dropdowns to the admin products list (`/fr/admin/products`). Selecting a parent category (e.g. Chimie) reveals a subcategory dropdown. Filter state lives in the URL via search params.

## Architecture

### Approach: URL search params + Server Component

Filter state is encoded in URL query params: `?category=<uuid>` and optionally `?subcategory=<uuid>`. The page reads `searchParams`, fetches only matching products server-side, and passes category data to a client component for the dropdowns.

### Files

| File | Change |
|------|--------|
| `app/src/app/[locale]/admin/products/page.tsx` | Add `searchParams` prop, fetch categories, conditional Supabase filter |
| `app/src/app/[locale]/admin/products/_components/FilterBar.tsx` | New client component — two controlled selects, drives URL |

## Data Flow

1. `page.tsx` fetches all categories (parents where `parent_id IS NULL`, children where `parent_id IS NOT NULL`) — one query, small result set.
2. Reads `searchParams.category` and `searchParams.subcategory`.
3. Builds Supabase products query with filter:
   - No params → fetch all products
   - Only `category` → `.in('category_id', [parentId, ...childIds])` (all products under that parent family)
   - `subcategory` present → `.eq('category_id', subcategoryId)`
4. Renders `<FilterBar>` with props: `parents`, `children`, `selectedCategory`, `selectedSubcategory`.
5. Renders product table with filtered results.

## FilterBar Component

**Type:** Client component (`'use client'`)

**Props:**
```ts
interface FilterBarProps {
  parents: Category[]
  children: Category[]
  selectedCategory: string
  selectedSubcategory: string
}
```

**Behavior:**
- Category `<select>`: "Toutes les catégories" + one option per parent. `onChange` → `router.push` with `?category=<id>`, clears subcategory param.
- Subcategory `<select>`: hidden (`display: none`) when no category selected. Shows "Toutes les sous-catégories" + children of selected parent. `onChange` → `router.push` with `?category=<id>&subcategory=<id>`.
- Uses `useRouter` + `useSearchParams` from Next.js App Router.

## Supabase Query Logic

```ts
let query = supabase
  .from('products')
  .select('*, categories(name), product_variants(id)')
  .order('created_at', { ascending: false })

if (subcategoryId) {
  query = query.eq('category_id', subcategoryId)
} else if (categoryId) {
  const childIds = allCategories
    .filter((c) => c.parent_id === categoryId)
    .map((c) => c.id)
  query = query.in('category_id', [categoryId, ...childIds])
}
```

## UX Notes

- Filter bar sits between the page header and the product table.
- Product count in the subtitle reflects filtered results.
- No submit button — filter applies immediately on `<select>` change via client-side navigation.
- Subcategory dropdown only appears when a parent category is selected.
- "Toutes les sous-catégories" resets to parent-level filter (removes `subcategory` param).

## Constraints

- No new dependencies.
- Server Component page — only `FilterBar` is a client component.
- Existing table rows and actions (edit, delete) unchanged.
