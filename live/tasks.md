# Task Queue

## Blocking (must clear before launch)
- [ ] Supabase project created + `.env` filled ← **DO THIS FIRST**
- [ ] Choose + archive LLM provider DPA (`compliance/dpa/`)
- [ ] Publish privacy notice (Arabic + French) naming AI sub-processors
- [ ] CNDP declaration filed (or prior authorisation if required)
- [ ] HTTPS enforced on all routes
- [ ] No secrets in code or frontend bundle ✅ (verified)

## Active — UI complete, moving to data layer
- [x] Homepage implemented from design (TopBar, Header, Hero, About, Promo, Services, Brands, Stats, Footer)
- [x] Tech stack locked: Next.js 16 + Supabase + Tailwind v4 + next-intl
- [x] All images in `app/public/images/`
- [ ] Supabase schema: products, categories, product_variants, product_images
- [ ] Supabase schema: orders, order_items, customers
- [ ] Admin panel: `/admin/products` (list + create + edit + image upload)
- [ ] Shop page: `/shop` with product grid + category filter
- [ ] Product detail page: `/shop/[slug]`

## Backlog
- [ ] Sub-pages: /chemicals, /glassware, /lab-equipment, /about, /contact, /catalogues
- [ ] Cart + quote request flow
- [ ] Checkout (CMI + Cash on delivery)
- [ ] Order management in admin
- [ ] Auth: admin login (protect /admin routes)
- [ ] CI/CD pipeline
- [ ] Integrate payment gateway (CMI)
- [ ] AI-powered feature (TBD)
