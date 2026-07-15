import type { Metadata } from 'next'
import type { CategoryRoute } from '@/lib/categoryRoutes'
import { CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'
import { getCityBySlug } from '@/lib/pseo/cities'
import { buildCityMetaDescription } from '@/lib/pseo/cityIntro'
import { SITE_URL } from '@/lib/siteConfig'

export function buildCityPageMetadata(categoryRoute: CategoryRoute, citySlug: string): Metadata {
  const city = getCityBySlug(citySlug)
  if (!city) return {}

  const label = CATEGORY_ROUTE_META[categoryRoute].breadcrumb
  const canonical = `${SITE_URL}/fr/${categoryRoute}/villes/${citySlug}`

  return {
    title: `${label} à ${city.name} | Le Laboratoire`,
    description: buildCityMetaDescription(categoryRoute, city),
    alternates: { canonical },
  }
}
