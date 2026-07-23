import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import CategoryCardGrid from '@/components/CategoryCardGrid'
import SearchBar from '@/components/SearchBar'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'
import { safeJsonLd, breadcrumbListJsonLd } from '@/lib/jsonLd'
import { SITE_URL } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

export default async function LabEquipmentPage() {
  const meta = CATEGORY_ROUTE_META['lab-equipment']
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const cards = groups.map((g) => ({
    href: `/fr/lab-equipment/groupe/${g.groupKey}`,
    img: g.groupKey === '__others__' ? '/images/glassware.webp' : `/images/groups/equipements/${g.groupKey}.webp`,
    title: g.groupLabel.fr,
  }))
  const breadcrumbJsonLd = breadcrumbListJsonLd([
    { name: 'Accueil', url: SITE_URL },
    { name: meta.breadcrumb, url: `${SITE_URL}/fr/lab-equipment` },
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
          <h1>{meta.title}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            {meta.breadcrumb}
          </div>
          <p className="lead">{meta.description}</p>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <SearchBar className="category-search" />
          <CategoryCardGrid items={cards} />
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
