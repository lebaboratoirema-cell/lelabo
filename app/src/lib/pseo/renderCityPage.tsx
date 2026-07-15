import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import CityDeliveryBlock from '@/components/CityDeliveryBlock'
import {
  getCategoryBySlug,
  getProductsByFamily,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META, type CategoryRoute } from '@/lib/categoryRoutes'
import { getCityBySlug } from '@/lib/pseo/cities'
import { buildCityIntro } from '@/lib/pseo/cityIntro'

export async function renderCityPage(categoryRoute: CategoryRoute, citySlug: string) {
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const meta = CATEGORY_ROUTE_META[categoryRoute]
  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS[categoryRoute])
  if (!parent) notFound()

  const allProducts = await getProductsByFamily(parent.id)
  const intro = buildCityIntro(categoryRoute, city)
  const basePath = `/fr/${categoryRoute}`

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{meta.title} à {city.name}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href={basePath}>{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {city.name}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <p className="city-intro">{intro}</p>
          <CityDeliveryBlock city={city} />
          <div className="shop-toolbar">
            <span className="count">{allProducts.length} produit{allProducts.length !== 1 ? 's' : ''}</span>
          </div>
          <ProductGrid products={allProducts} basePath={basePath} />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
