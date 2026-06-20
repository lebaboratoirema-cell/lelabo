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

interface Props {
  params: Promise<{ subcategory: string }>
}

export default async function LabEquipmentSubcategoryPage({ params }: Props) {
  const { subcategory } = await params
  const meta = CATEGORY_ROUTE_META['lab-equipment']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (!child || child.parent_id !== parent.id) notFound()

  const siblings = await getChildCategories(parent.id)
  const products = await getProductsByCategory(child.id)

  const chips = siblings.map((c) => ({
    label: (c.name as { fr: string }).fr,
    href: `/fr/lab-equipment/${c.slug}`,
    slug: c.slug,
  }))

  const childLabel = (child.name as { fr: string }).fr

  return (
    <>
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
            <a href="/fr/lab-equipment">{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {childLabel}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="shop-toolbar">
            <span className="count">{products.length} produit{products.length !== 1 ? 's' : ''}</span>
            <CategoryChips chips={chips} activeSlug={child.slug} allHref="/fr/lab-equipment" />
          </div>
          <ProductGrid products={products} />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
