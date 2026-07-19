import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductDetailPage from '@/components/ProductDetailPage'
import {
  getCategoryBySlug,
  getProductBySlug,
  getRelatedProducts,
} from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ subcategory: string; product: string }>
}

export default async function PetitOutillageProductPage({ params }: Props) {
  const { subcategory, product: productSlug } = await params
  const meta = CATEGORY_ROUTE_META['petit-outillage']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['petit-outillage'])
  if (!parent) notFound()

  const child = await getCategoryBySlug(subcategory)
  if (!child || child.parent_id !== parent.id) notFound()

  const product = await getProductBySlug(productSlug)
  if (!product || product.category_id !== child.id) notFound()

  const related = await getRelatedProducts(child.id, product.id)
  const childLabel = (child.name as { fr: string }).fr

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />
      <ProductDetailPage
        product={product}
        related={related}
        breadcrumbs={[
          { label: meta.breadcrumb, href: '/fr/petit-outillage' },
          { label: childLabel, href: `/fr/petit-outillage/${child.slug}` },
        ]}
        basePath={`/fr/petit-outillage/${child.slug}`}
      />
      <SiteFooter />
    </>
  )
}
