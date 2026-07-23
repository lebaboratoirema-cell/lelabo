import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CategoryChips from '@/components/CategoryChips'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { safeJsonLd, breadcrumbListJsonLd } from '@/lib/jsonLd'
import { SITE_URL } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string }>
}

export default async function GlasswareSubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const meta = CATEGORY_ROUTE_META.glassware

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.glassware)
  if (!parent) notFound()

  const siblings = await getChildCategories(parent.id)

  // Try slug as a child category first
  const child = await getCategoryBySlug(subcategory)
  if (child && child.parent_id === parent.id) {
    const products = await getProductsByCategory(child.id)

    const chips = siblings.map((c) => ({
      label: (c.name as { fr: string }).fr,
      href: `/fr/glassware/${c.slug}`,
      slug: c.slug,
    }))

    const childLabel = (child.name as { fr: string }).fr
    const breadcrumbJsonLd = breadcrumbListJsonLd([
      { name: 'Accueil', url: SITE_URL },
      { name: meta.breadcrumb, url: `${SITE_URL}/fr/glassware` },
      { name: childLabel, url: `${SITE_URL}/fr/glassware/${child.slug}` },
    ])

    return (
      <>
        {/* JSON-LD: safeJsonLd escapes `<` so DB-sourced category names cannot break out of the script tag */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
        />
        <ScrollReveal />
        <TopBar />
        <Header />

        <section className="page-banner">
          <img className="bgimg" src={meta.bannerImage} alt="" />
          <div className="wrap">
            <h1>{childLabel}</h1>
            <div className="breadcrumb">
              <a href="/fr">Accueil</a>
              <span className="sep">/</span>
              <a href="/fr/glassware">{meta.breadcrumb}</a>
              <span className="sep">/</span>
              {childLabel}
            </div>
          </div>
        </section>

        <section className="block">
          <div className="wrap">
            <div className="shop-toolbar">
              <span className="count">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
              <CategoryChips chips={chips} activeSlug={child.slug} allHref="/fr/glassware" />
            </div>
            <ProductGrid products={products} basePath={`/fr/glassware/${child.slug}`} />
          </div>
        </section>

        <SiteFooter />
      </>
    )
  }

  // Try slug as a product directly under the glassware parent
  const product = await getProductBySlug(subcategory)
  const familyIds = [parent.id, ...siblings.map((c) => c.id)]
  if (product && familyIds.includes(product.category_id)) {
    const related = await getRelatedProducts(product.category_id, product.id)

    return (
      <>
        <ScrollReveal />
        <TopBar />
        <Header />
        <ProductDetailPage
          product={product}
          related={related}
          breadcrumbs={[{ label: meta.breadcrumb, href: '/fr/glassware' }]}
          basePath="/fr/glassware"
        />
        <SiteFooter />
      </>
    )
  }

  notFound()
}
