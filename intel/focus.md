# Current Focus

**Active initiative:** Product catalog + admin dashboard
**Blockers:** Supabase project not created yet (no real env vars)
**Next decision needed:** none — stack is fully locked

## What was completed (session 2026-06-19)
- Homepage UI implemented from design (claude.ai/design project 706e2d4a)
- 10 components built: TopBar, Header, HeroSlider, ContactStrip, AboutSection, PromoSection, ServicesSection, BrandsSection, StatsSection, SiteFooter + ScrollReveal
- All images downloaded to `app/public/images/`
- All text in French
- Build passes clean (Next.js 16.2.9 + TypeScript)

## Immediate next steps (in order)
1. **Create Supabase project** at supabase.com → copy URL + anon key into `.env`
2. **Define schema** in Supabase SQL editor (products, categories, product_variants, product_images, orders, order_items)
3. **Build admin panel** `/admin/products` — list, add, edit products with image upload
4. **Build `/shop` page** — fetch products from Supabase, render product grid
5. Build sub-pages: `/chemicals`, `/glassware`, `/lab-equipment`, `/about`, `/contact`, `/catalogues`
6. Checkout flow (CMI + COD)
