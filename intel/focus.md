# Current Focus

**Active initiative:** Database schema — run migration + finish TypeScript types
**Blockers:** SQL migration not run yet — needs DB password (Supabase → Settings → Database → Connection string)
**Next decision needed:** none — plan is ready

## What was completed (session 2026-06-20)
- Supabase project connected — `.env.local` filled with real URL + keys
- Schema designed and approved (6 tables: categories, products, product_variants, product_images, orders, order_items)
- SQL migration written: `supabase/migrations/001_initial_schema.sql`
- Storage bucket `product-images` created (public, 5MB, jpg/png/webp)
- Design spec: `docs/superpowers/specs/2026-06-20-database-schema-design.md`
- Implementation plan: `docs/superpowers/plans/2026-06-20-database-schema.md`

## Immediate next steps (in order)
1. **Run SQL migration** — get DB password: Supabase dashboard → Settings → Database → Connection string (paste to Claude, it will run `supabase/migrations/001_initial_schema.sql` via pg)
2. **Write TypeScript types** — `app/src/types/database.ts` (plan Task 4)
3. **Update compliance doc** — add PII retention note to `compliance/regulatory-track.md` (plan Task 5)
4. **Build admin panel** `/admin/products` — list, add, edit products with image upload
5. **Build `/shop` page** — fetch products from Supabase, render product grid
6. Build sub-pages: `/chemicals`, `/glassware`, `/lab-equipment`, `/about`, `/contact`, `/catalogues`
7. Checkout flow (CMI + COD)
