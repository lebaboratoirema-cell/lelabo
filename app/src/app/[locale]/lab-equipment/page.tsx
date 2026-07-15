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
  getProductsByFamily,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'

export const dynamic = 'force-dynamic'

export default async function LabEquipmentPage() {
  const meta = CATEGORY_ROUTE_META['lab-equipment']
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const children = await getChildCategories(parent.id)

  const allProducts = await getProductsByFamily(parent.id)

  const chips = children.map((c) => ({
    label: (c.name as { fr: string }).fr,
    href: `/fr/lab-equipment/${c.slug}`,
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
              <CategoryChips chips={chips} activeSlug={null} allHref="/fr/lab-equipment" />
            </div>
          )}
          <ProductGrid products={allProducts} basePath="/fr/lab-equipment" />
        </div>
      </section>

      <section className="block city-links">
        <div className="wrap">
          <h2>Livraison dans votre ville</h2>
          <ul className="city-link-list">
            {CITIES.map((city) => (
              <li key={city.slug}>
                <a href={`/fr/lab-equipment/villes/${city.slug}`}>
                  Équipements à {city.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
