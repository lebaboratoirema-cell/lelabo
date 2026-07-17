import type { ProductWithImage } from '@/lib/supabase/queries'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

interface Props {
  products: (ProductWithImage & { basePath?: string })[]
  basePath?: string
  emptyMessage?: string
}

export default function ProductGrid({ products, basePath, emptyMessage }: Props) {
  if (products.length === 0) {
    return (
      <p className="empty-state">{emptyMessage ?? 'Aucun produit dans cette catégorie pour l’instant.'}</p>
    )
  }

  return (
    <div className="product-grid">
      {products.map((p) => {
        const primaryImage = p.product_images.find((img) => img.is_primary) ?? p.product_images[0]
        const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.webp'
        const href = `${p.basePath ?? basePath}/${p.slug}`

        return (
          <a className="product-card reveal" href={href} key={p.id}>
            <div className="pimg">
              {p.promo_label && (
                <span className="promo-badge">{p.promo_label}</span>
              )}
              <img src={imgSrc} alt={(p.name as { fr: string }).fr} />
              <span className="stock-badge">
                <span className="sdot" style={{ background: p.in_stock ? '#16a34a' : '#9ca3af' }} />
                {p.in_stock ? 'En stock' : 'Sur commande'}
              </span>
            </div>
            <div className="pbody">
              <h3>{(p.name as { fr: string }).fr}</h3>
            </div>
          </a>
        )
      })}
    </div>
  )
}
