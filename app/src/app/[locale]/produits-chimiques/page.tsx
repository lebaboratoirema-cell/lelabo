import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import CategoryCardGrid from '@/components/CategoryCardGrid'
import SearchBar from '@/components/SearchBar'
import { getCategoryBySlug, getChildCategories } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'
import { safeJsonLd, breadcrumbListJsonLd } from '@/lib/jsonLd'
import { SITE_URL } from '@/lib/siteConfig'

export const dynamic = 'force-dynamic'

export default async function ChemicalsPage() {
  const meta = CATEGORY_ROUTE_META.chemicals
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS.chemicals)
  if (!parent) notFound()

  const children = await getChildCategories(parent.id)
  const cards = children.map((c) => ({
    href: `/fr/produits-chimiques/${c.slug}`,
    img: `/images/groups/chimie/${c.slug}.webp`,
    title: (c.name as { fr: string }).fr,
  }))
  const breadcrumbJsonLd = breadcrumbListJsonLd([
    { name: 'Accueil', url: SITE_URL },
    { name: meta.breadcrumb, url: `${SITE_URL}/fr/produits-chimiques` },
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
                <a href={`/fr/produits-chimiques/villes/${city.slug}`}>
                  Produits chimiques à {city.name}
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
