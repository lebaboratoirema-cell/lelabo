# Category Management — Design Spec

**Date:** 2026-06-20
**Status:** Approved

## Goal

Add full category CRUD to the admin dashboard, plus a quick-access link from the product form so admins can create a category without losing product form state.

## Approach

Option A: Dedicated `/admin/categories` section (list, create, edit) + "+" link in ProductForm that opens `/admin/categories/new` in a new tab.

## File Structure

```
app/src/app/[locale]/admin/categories/
  page.tsx                     — category list (server component)
  new/page.tsx                 — create page (server shell)
  [id]/edit/page.tsx           — edit page (server shell)
  _components/
    CategoryForm.tsx           — client form, handles create + edit
    DeleteCategoryButton.tsx   — client delete with confirm dialog
    actions.ts                 — createCategory, updateCategory, deleteCategory
```

No new TypeScript types needed — `Category` is already defined in `app/src/types/database.ts`.

## CategoryForm Fields

| Field | Type | Notes |
|---|---|---|
| `name.fr` | string, required | French name |
| `slug` | string, required | Auto-generated from `name.fr` via `slugify()`, user-editable |
| `parent_id` | string, optional | Select from existing categories (root if empty) |
| `is_active` | boolean | Toggle, default true |

Fields **excluded** (YAGNI): `description`, `image_url`, `position`.

Slug auto-fills on first keystroke of the name field. If the user manually edits slug, auto-fill stops.

## Server Actions (`actions.ts`)

- **`createCategory(formData)`** — insert row, redirect to `/fr/admin/categories`
- **`updateCategory(id, formData)`** — update row, redirect to `/fr/admin/categories`
- **`deleteCategory(id)`** — delete row (guard: reject if any product references this category), `revalidatePath`

`slugify` function already exists in `app/src/app/[locale]/admin/products/_components/actions.ts` — copy or extract to a shared util.

## Category List Page

Mirrors product list design. Table columns: Name (fr), Slug, Parent, Active toggle, Edit/Delete actions. Server component fetches all categories ordered by `position`.

## ProductForm Change

In `ProductForm.tsx` line ~122, add a small link to the right of the "Catégorie" label:

```tsx
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
  <label style={label}>Catégorie <span style={{ color: '#c8643c' }}>*</span></label>
  <a href="/fr/admin/categories/new" target="_blank" rel="noopener noreferrer"
     style={{ fontSize: 12, color: '#c8643c', textDecoration: 'none', fontWeight: 600 }}>
    + Nouvelle catégorie ↗
  </a>
</div>
```

After creating a category in the new tab, user closes it and refreshes the product form to see the new option in the dropdown.

## Admin Nav Change

Add "Catégories" link to `layout.tsx` header nav between Produits and Commandes. Active state: hardcode active style when `pathname` includes `/admin/categories` — convert the nav section to a client component (`'use client'`) using `usePathname()`.

## Constraints

- `deleteCategory` must check for products using `category_id` before deleting. If any exist, return error — do not delete.
- No image upload for categories (image_url field skipped).
- Slug uniqueness enforced by DB unique constraint (already in schema).
