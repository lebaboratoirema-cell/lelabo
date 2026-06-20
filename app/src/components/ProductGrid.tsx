import type { ProductWithImage } from '@/lib/supabase/queries'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

export default function ProductGrid({ products }: { products: ProductWithImage[] }) {
  if (products.length === 0) {
    return (
      <p className="empty-state">Aucun produit dans cette catégorie pour l&apos;instant.</p>
    )
  }

  return (
    <div className="product-grid">
      {products.map((p) => {
        const primaryImage = p.product_images.find((img) => img.is_primary) ?? p.product_images[0]
        const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.jpg'

        return (
          <div className="product-card reveal" key={p.id}>
            <div className="pimg">
              <img src={imgSrc} alt={(p.name as { fr: string }).fr} />
              {p.brand && <span className="tag">{p.brand}</span>}
            </div>
            <div className="pbody">
              <h3>{(p.name as { fr: string }).fr}</h3>
              <p>{(p.description as { fr?: string } | null)?.fr ?? ''}</p>
              <div className="pfoot">
                <span className="price">Sur demande</span>
                <a href="/fr/contact" className="btn btn-sm">Demander un devis</a>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
