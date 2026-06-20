import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CategoryChips from '@/components/CategoryChips'
import {
  getCategoryBySlug,
  getChildCategories,
  getProductsByCategory,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export default async function ChemicalsPage() {
  const meta = CATEGORY_ROUTE_META.chemicals
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
  if (!parent) notFound()

  const children = await getChildCategories(parent.id)

  const allProducts = children.length > 0
    ? (await Promise.all(children.map((c) => getProductsByCategory(c.id)))).flat()
    : await getProductsByCategory(parent.id)

  const chips = children.map((c) => ({
    label: (c.name as { fr: string }).fr,
    href: `/fr/chemicals/${c.slug}`,
    slug: c.slug,
  }))

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{meta.title}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            {meta.breadcrumb}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          {chips.length > 0 && (
            <div className="shop-toolbar">
              <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
              <CategoryChips chips={chips} activeSlug={null} allHref="/fr/chemicals" />
            </div>
          )}
          <ProductGrid products={allProducts} />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
