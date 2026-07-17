import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import ProductGrid from '@/components/ProductGrid'
import { searchProducts } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function RecherchePage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = (q ?? '').trim()
  const results = query ? await searchProducts(query) : []

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-tech.webp" alt="" />
        <div className="wrap">
          <h1>Résultats de recherche</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Recherche
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="shop-toolbar">
            <span className="count">
              {query
                ? `${results.length} résultat${results.length !== 1 ? 's' : ''} pour « ${query} »`
                : 'Entrez un terme de recherche'}
            </span>
          </div>
          <ProductGrid
            products={results}
            emptyMessage={
              query
                ? `Aucun produit ne correspond à « ${query} ».`
                : 'Utilisez la barre de recherche pour trouver un produit.'
            }
          />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
