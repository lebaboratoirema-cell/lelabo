import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import { getCategoryBySlug, getChildCategoriesGrouped } from '@/lib/supabase/queries'
import { CATEGORY_ROUTE_SLUGS, CATEGORY_ROUTE_META } from '@/lib/categoryRoutes'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ group: string }>
}

export default async function LabEquipmentGroupPage({ params }: Props) {
  const { group: groupKey } = await params
  const meta = CATEGORY_ROUTE_META['lab-equipment']

  const parent = await getCategoryBySlug(CATEGORY_ROUTE_SLUGS['lab-equipment'])
  if (!parent) notFound()

  const groups = await getChildCategoriesGrouped(parent.id)
  const group = groups.find((g) => g.groupKey === groupKey)
  if (!group) notFound()

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={meta.bannerImage} alt="" />
        <div className="wrap">
          <h1>{group.groupLabel.fr}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href="/fr/lab-equipment">{meta.breadcrumb}</a>
            <span className="sep">/</span>
            {group.groupLabel.fr}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="subcat-list">
            {group.categories.map((c) => (
              <a href={`/fr/lab-equipment/${c.slug}`} key={c.id}>
                {(c.name as { fr: string }).fr}
              </a>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
