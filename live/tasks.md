# Task Queue

## Blocking (must clear before launch)
- [ ] Supabase project created + `.env` filled ← **DO THIS FIRST**
- [ ] Choose + archive LLM provider DPA (`compliance/dpa/`)
- [ ] Publish privacy notice (Arabic + French) naming AI sub-processors
- [ ] CNDP declaration filed (or prior authorisation if required)
- [ ] HTTPS enforced on all routes
- [ ] No secrets in code or frontend bundle ✅ (verified)

## Done this session
- [x] Homepage implemented (10 components)
- [x] Tech stack locked: Next.js 16 + Supabase + Tailwind v4 + next-intl
- [x] Supabase schema: 6 tables live (categories, products, product_variants, product_images, orders, order_items)
- [x] Admin panel: products + categories full CRUD with image upload
- [x] Public category pages: /chemicals, /glassware, /lab-equipment wired to Supabase DB
- [x] Other public pages: /about, /contact, /shop, /catalogues
- [x] Subcategory pages: /chemicals/[slug], /glassware/[slug], /lab-equipment/[slug] — DB-driven, 404 on unknown slug
- [x] Shared components: ProductGrid, CategoryChips
- [x] Category slug config: chimie / verrerie / equipements

## Backlog
- [ ] Auth guard on /admin routes — **plan ready**, execute `docs/superpowers/plans/2026-06-20-admin-auth-guard.md` (subagent-driven). BLOCKER before go-live.
- [ ] Product detail page: `/shop/[slug]`
- [ ] Cart + quote request flow
- [ ] Checkout (CMI + Cash on delivery)
- [ ] Order management in admin
- [ ] CI/CD pipeline
- [ ] Integrate payment gateway (CMI)
- [ ] Law 09-08 compliance note in `compliance/regulatory-track.md`
