import { getFeaturedProducts } from '@/lib/supabase/queries'
import ProductCarousel from '@/components/ProductCarousel'

export default async function FeaturedProducts() {
  const products = await getFeaturedProducts(15)

  if (products.length === 0) return null

  return (
    <section className="block featured" id="featured">
      <div className="wrap">
        <div className="brands-head reveal">
          <span className="eyebrow">Sélection haut de gamme</span>
          <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>
            Nos équipements les plus prisés
          </h2>
          <p>L&apos;essentiel de notre catalogue premium, choisi pour sa fiabilité et sa performance en laboratoire.</p>
        </div>

        <div className="reveal">
          <ProductCarousel products={products} />
        </div>
      </div>
    </section>
  )
}
