import type { ProductWithVariants, ProductWithImage } from '@/lib/supabase/queries'
import ProductGrid from '@/components/ProductGrid'
import QuoteModal from '@/components/QuoteModal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`
}

interface Props {
  product: ProductWithVariants
  related: ProductWithImage[]
  breadcrumbs: { label: string; href: string }[]
  basePath: string
}

export default function ProductDetailPage({ product, related, breadcrumbs, basePath }: Props) {
  const name = (product.name as { fr: string }).fr
  const description = (product.description as { fr?: string } | null)?.fr ?? ''
  const hasVariants = product.product_variants.length > 0

  const specs = product.specifications
  const specEntries = specs ? Object.entries(specs) : []

  const primaryImage = product.product_images.find((img) => img.is_primary) ?? product.product_images[0]
  const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.webp'
  const allImages = product.product_images.map((img) => getImageUrl(img.storage_path))

  return (
    <>
      {/* Breadcrumb banner */}
      <section className="page-banner" style={{ padding: '54px 0' }}>
        <img className="bgimg" src={allImages[0] ?? '/images/glassware.webp'} alt="" />
        <div className="wrap">
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            {breadcrumbs.map((bc) => (
              <span key={bc.href}>
                <span className="sep">/</span>
                <a href={bc.href}>{bc.label}</a>
              </span>
            ))}
            <span className="sep">/</span>
            {name}
          </div>
        </div>
      </section>

      {/* Product detail */}
      <section className="block" style={{ padding: '60px 0 80px' }}>
        <div className="wrap">
          <div className="pd-grid">
            {/* Gallery */}
            <div className="pd-gallery">
              <div className="pd-main">
                <span className="pd-badge">En stock</span>
                <img id="pdMain" src={imgSrc} alt={name} />
              </div>
              {allImages.length > 1 && (
                <div className="pd-thumbs">
                  {allImages.map((src, i) => (
                    <button
                      key={src}
                      className={`pd-thumb${i === 0 ? ' active' : ''}`}
                      data-src={src}
                    >
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              {product.brand && <span className="pd-brand">{product.brand}</span>}
              <h1>{name}</h1>
              <p className="pd-lead">{description}</p>

              <div className="pd-quote-price">
                <span className="big">Sur demande</span>
                <span className="label">Prix sur devis · Remises volume disponibles</span>
              </div>

              {hasVariants && (
                <div className="pd-opt">
                  <div className="opt-label">Variante</div>
                  <div className="opt-row">
                    {product.product_variants.map((v) => (
                      <span key={v.id} className="opt-pill">
                        {(v.name as { fr: string }).fr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pd-buy">
                <QuoteModal productName={name} />
              </div>

              <div className="pd-meta">
                <div className="mrow"><b>Référence</b> <span>{product.slug}</span></div>
                <div className="mrow">
                  <b>Catégorie</b>{' '}
                  <span>
                    {breadcrumbs.map((bc, i) => (
                      <span key={bc.href}>
                        {i > 0 && ', '}
                        <a href={bc.href}>{bc.label}</a>
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="pd-trust reveal">
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/></svg>
              </span>
              <div><h5>Livraison nationale</h5><p>Partout au Maroc</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/></svg>
              </span>
              <div><h5>Retours 7 jours</h5><p>Sur articles en stock</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.1V12a10 10 0 11-5.9-9.1"/><path d="M22 4L12 14.1l-3-3"/></svg>
              </span>
              <div><h5>Qualité certifiée</h5><p>Conforme ISO &amp; DIN</p></div>
            </div>
            <div className="trust">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </span>
              <div><h5>Conseil technique</h5><p>Équipe experte disponible</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Description tab */}
      <section className="block bg-soft" style={{ padding: '70px 0' }}>
        <div className="wrap">
          <div className="pd-tabs-nav">
            <button className="active">Description</button>
            <button>Livraison &amp; retours</button>
          </div>
          <div className="pd-panel active">
            <p>{description}</p>
          </div>
          {specEntries.length > 0 && (
            <div className="pd-specs">
              <h3>Caractéristiques techniques</h3>
              <table className="pd-specs-table">
                <tbody>
                  {specEntries.map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="block" style={{ padding: '80px 0 90px' }}>
          <div className="wrap">
            <div className="section-head reveal" style={{ marginBottom: '40px' }}>
              <span className="eyebrow">Vous pourriez aussi avoir besoin</span>
              <h2>Produits similaires</h2>
            </div>
            <ProductGrid products={related} basePath={basePath} />
          </div>
        </section>
      )}
    </>
  )
}
