---
name: product-visibility-fix
description: Fix products not appearing on public category pages after being added via admin — query refactor + admin UX fix
metadata:
  type: project
---

# Product Visibility Fix — Design Spec

**Date:** 2026-06-21  
**Status:** Approved

## Problem

Products added via admin do not appear on public category pages (`/fr/chemicals`, `/fr/glassware`, `/fr/lab-equipment`).

### Root causes

1. **Parent-level products invisible.** `chemicals/page.tsx` (and siblings) use this logic:
   ```ts
   const allProducts = children.length > 0
     ? fetch from children only   // products assigned to parent are lost
     : fetch from parent
   ```
   A product assigned to "Chimie" (parent category) when child categories exist is never fetched and never shown.

2. **Admin category dropdown is flat.** `ProductForm` receives a flat `Category[]` list with parents and children mixed. No grouping, no indication of hierarchy. Easy to accidentally assign a product to a parent category, triggering bug #1.

3. **`revalidatePath` targets wrong paths.** Current calls revalidate `/admin/products` and `'/', 'layout'` — neither reliably busts `/fr/chemicals`, `/fr/glassware`, `/fr/lab-equipment` in a localized Next.js 15 app.

---

## Architecture

No schema changes. No new routes. 10 files touched.

### Data layer — `src/lib/supabase/queries.ts`

Add `getProductsByFamily(parentId: string)`:

```ts
export async function getProductsByFamily(parentId: string): Promise<ProductWithImage[]> {
  const supabase = await createClient()

  const { data: children } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', parentId)
    .eq('is_active', true)

  const categoryIds = [parentId, ...(children ?? []).map(c => c.id)]

  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_path, is_primary)')
    .in('category_id', categoryIds)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (data as ProductWithImage[]) ?? []
}
```

Two queries: one for child IDs, one for products across parent + children. No duplicates possible (each product has one `category_id`). Replaces the current conditional multi-fetch pattern on all 3 parent pages.

Existing `getChildCategories` and `getProductsByCategory` remain — still used by subcategory pages.

---

### Public pages — parent pages (3 files)

`chemicals/page.tsx`, `glassware/page.tsx`, `lab-equipment/page.tsx`:

- Add `export const dynamic = 'force-dynamic'` at top
- Replace current product fetch with `getProductsByFamily(parent.id)`
- Remove now-unused local `children` variable (children are still fetched for the `CategoryChips` nav — keep that)
- Keep `chips` construction from `getChildCategories` unchanged

**Before:**
```ts
const allProducts = children.length > 0
  ? (await Promise.all(children.map((c) => getProductsByCategory(c.id)))).flat()
  : await getProductsByCategory(parent.id)
```

**After:**
```ts
const allProducts = await getProductsByFamily(parent.id)
```

---

### Public pages — subcategory pages (3 files)

`chemicals/[subcategory]/page.tsx`, `glassware/[subcategory]/page.tsx`, `lab-equipment/[subcategory]/page.tsx`:

- Add `export const dynamic = 'force-dynamic'` only
- No logic changes — these pages already fetch correctly by specific child category

---

### Server actions — `actions.ts`

Replace current `revalidatePath` calls in `createProduct`, `updateProduct`, and `deleteProduct`:

**Before:**
```ts
revalidatePath('/admin/products')
revalidatePath('/', 'layout')
```

**After:**
```ts
revalidatePath('/fr/chemicals', 'page')
revalidatePath('/fr/glassware', 'page')
revalidatePath('/fr/lab-equipment', 'page')
revalidatePath('/[locale]', 'layout')
```

The layout-level call busts subcategory pages. The explicit page calls ensure parent pages are revalidated even if still statically cached.

---

### Admin product form — 3 files

**`new/page.tsx` and `[id]/edit/page.tsx`:**

Change category fetch to separate parents and children:

```ts
const { data: allCats } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('position')

const parents = (allCats ?? []).filter(c => !c.parent_id)
const childCategories = (allCats ?? []).filter(c => c.parent_id)
```

Pass `parents` and `childCategories` as separate props to `ProductForm`.

**`ProductForm.tsx`:**

Update props interface:
```ts
interface Props {
  parents: Category[]
  childCategories: Category[]
  product?: Product
  variants?: ProductVariant[]
  images?: ProductImage[]
}
```

Replace flat `<select>` with grouped `<optgroup>` select. Parent categories are group labels only — not selectable. Only leaf (child) categories are `<option>` elements:

```tsx
<select name="category_id" required value={categoryId} onChange={...}>
  <option value="" disabled>Sélectionner une catégorie…</option>
  {parents.map(parent => (
    <optgroup key={parent.id} label={(parent.name as {fr: string}).fr}>
      {childCategories
        .filter(c => c.parent_id === parent.id)
        .map(c => (
          <option key={c.id} value={c.id}>
            {(c.name as {fr: string}).fr}
          </option>
        ))
      }
    </optgroup>
  ))}
</select>
```

`categoryLabel` helper in form also needs update to look in `childCategories` prop instead of old flat `categories` prop.

---

## Files changed

| File | Change |
|------|--------|
| `src/lib/supabase/queries.ts` | Add `getProductsByFamily` |
| `src/app/[locale]/chemicals/page.tsx` | Use `getProductsByFamily` + force-dynamic |
| `src/app/[locale]/glassware/page.tsx` | Use `getProductsByFamily` + force-dynamic |
| `src/app/[locale]/lab-equipment/page.tsx` | Use `getProductsByFamily` + force-dynamic |
| `src/app/[locale]/chemicals/[subcategory]/page.tsx` | Add force-dynamic |
| `src/app/[locale]/glassware/[subcategory]/page.tsx` | Add force-dynamic |
| `src/app/[locale]/lab-equipment/[subcategory]/page.tsx` | Add force-dynamic |
| `src/app/[locale]/admin/products/new/page.tsx` | Fetch parents + children separately, new props |
| `src/app/[locale]/admin/products/[id]/edit/page.tsx` | Fetch parents + children separately, new props |
| `src/app/[locale]/admin/products/_components/ProductForm.tsx` | New props + optgroup dropdown |
| `src/app/[locale]/admin/products/_components/actions.ts` | Fix revalidatePath calls |

**Total: 11 files. No schema changes. No new routes.**

---

## Error handling

- `getProductsByFamily` returns `[]` on error (consistent with existing query pattern)
- If a parent category has no children in DB, `categoryIds` = `[parentId]` — query still works, fetches parent-level products
- If admin opens edit form for a product assigned to a parent category (legacy data), the `categoryId` state won't match any `<option>` — select will show blank, user must reselect. Acceptable edge case for MVP.

---

## Testing

1. Add product assigned to a child category → appears on parent page (`/fr/chemicals`) AND subcategory page (`/fr/chemicals/acides`)
2. Add product assigned directly to parent category → appears on parent page (`/fr/chemicals`)
3. Admin new product form — category dropdown shows grouped optgroups, parent names are not selectable
4. Delete product → revalidation clears it from public pages on next load
