import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteConfig'
import { CATEGORY_ROUTE_SLUGS } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'
import { routing } from '@/i18n/routing'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/shop', '/about', '/contact', '/catalogues', '/blog']
  const categoryKeys = Object.keys(CATEGORY_ROUTE_SLUGS)
  const categoryPaths = categoryKeys.map((key) => `/${key}`)

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    [...staticPaths, ...categoryPaths].map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
    })),
  )

  const cityEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    categoryKeys.flatMap((categoryKey) =>
      CITIES.map((city) => ({
        url: `${SITE_URL}/${locale}/${categoryKey}/villes/${city.slug}`,
        lastModified: new Date(),
      })),
    ),
  )

  return [...staticEntries, ...cityEntries]
}
