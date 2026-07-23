import { createServiceClient } from '@/lib/supabase/service'
import type { Category } from '@/types/database'
import FeaturedForm from './_components/FeaturedForm'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getThumbUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/render/image/public/product-images/${storagePath}?width=80&quality=70`
}

export default async function AdminFeaturedPage() {
  const supabase = createServiceClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*, product_images(storage_path, is_primary)').eq('is_active', true),
    supabase.from('categories').select('id, name'),
  ])

  const categoryNameById = new Map(((categories ?? []) as Pick<Category, 'id' | 'name'>[]).map((c) => [c.id, c.name.fr]))

  const rows = ((products ?? []) as any[])
    .map((p) => {
      const primaryImage = p.product_images?.find((img: any) => img.is_primary) ?? p.product_images?.[0]
      return {
        id: p.id,
        name: p.name.fr,
        categoryName: categoryNameById.get(p.category_id) ?? '—',
        isFeatured: p.is_featured,
        featuredPosition: p.featured_position,
        imageUrl: primaryImage ? getThumbUrl(primaryImage.storage_path) : null,
      }
    })
    .sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="admin-page-pad">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px', color: '#1c2230' }}>
          Produits en vedette
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>
          Choisissez les produits affichés dans le carrousel de la page d&apos;accueil. Sans sélection, les produits les plus chers de chaque catégorie sont affichés automatiquement.
        </p>
      </div>

      {rows.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '48px 28px', textAlign: 'center', color: '#8a8478' }}>
          Aucun produit actif pour le moment.
        </div>
      ) : (
        <FeaturedForm products={rows} />
      )}
    </div>
  )
}
