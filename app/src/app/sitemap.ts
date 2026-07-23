import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteConfig'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_SEGMENT, type CategoryRoute } from '@/lib/categoryRoutes'
import { CITIES } from '@/lib/pseo/cities'
import { routing } from '@/i18n/routing'
import { getAllProductsForSitemap, getBlogPosts } from '@/lib/supabase/queries'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ['', '/shop', '/about', '/contact', '/catalogues', '/blog']
  const categoryKeys = Object.keys(CATEGORY_ROUTE_SLUGS) as CategoryRoute[]
  const categoryPaths = categoryKeys.map((key) => `/${CATEGORY_ROUTE_SEGMENT[key]}`)

  const staticEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    [...staticPaths, ...categoryPaths].map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: new Date(),
    })),
  )

  const cityEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    categoryKeys.flatMap((categoryKey) =>
      CITIES.map((city) => ({
        url: `${SITE_URL}/${locale}/${CATEGORY_ROUTE_SEGMENT[categoryKey]}/villes/${city.slug}`,
        lastModified: new Date(),
      })),
    ),
  )

  const [products, posts] = await Promise.all([getAllProductsForSitemap(), getBlogPosts()])

  const productEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    products.map((p) => ({
      url: `${SITE_URL}/${locale}${p.basePath.replace(/^\/fr/, '')}/${p.slug}`,
      lastModified: new Date(),
    })),
  )

  const blogEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    posts.map((post) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
    })),
  )

  return [...staticEntries, ...cityEntries, ...productEntries, ...blogEntries]
}
