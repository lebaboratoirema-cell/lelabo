import { createServiceClient } from '@/lib/supabase/service'
import type { Category } from '@/types/database'
import DeleteButton from './_components/DeleteButton'
import FilterBar from './_components/FilterBar'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getThumbUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/render/image/public/product-images/${storagePath}?width=80&quality=70`
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; subcategory?: string; q?: string }>
}) {
  const { category, subcategory, q } = await searchParams

  const supabase = createServiceClient()

  const { data: allCats } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position')

  const parents = ((allCats ?? []) as Category[]).filter((c) => !c.parent_id)
  const childCategories = ((allCats ?? []) as Category[]).filter((c) => !!c.parent_id)

  const categoryParam = category ?? ''
  const subcategoryParam = subcategory ?? ''
  const searchParam = q ?? ''

  function buildQuery() {
    let query = supabase
      .from('products')
      .select('*, categories(name), product_variants(id), product_images(storage_path, is_primary)')
      .order('created_at', { ascending: false })

    if (subcategoryParam) {
      query = query.eq('category_id', subcategoryParam)
    } else if (categoryParam) {
      const childIds = childCategories
        .filter((c) => c.parent_id === categoryParam)
        .map((c) => c.id)
      query = query.in('category_id', [categoryParam, ...childIds])
    }

    if (searchParam) {
      const safe = searchParam.replace(/[,()%]/g, ' ').trim()
      if (safe) {
        query = query.or(`name->>fr.ilike.%${safe}%,name->>en.ilike.%${safe}%,brand.ilike.%${safe}%`)
      }
    }

    return query
  }

  const products: any[] = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data: page } = await buildQuery().range(from, from + pageSize - 1)
    if (!page || page.length === 0) break
    products.push(...page)
    if (page.length < pageSize) break
  }

  return (
    <div className="admin-page-pad">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px', color: '#1c2230' }}>Produits</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>{products?.length ?? 0} produit{(products?.length ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <a
          href="/fr/admin/products/new"
          style={{ height: 44, padding: '0 22px', border: 'none', borderRadius: 11, background: '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(28,43,70,0.2)', textDecoration: 'none' }}
        >
          + Nouveau produit
        </a>
      </div>

      <FilterBar
        parents={parents}
        subcategories={childCategories}
        selectedCategory={categoryParam}
        selectedSubcategory={subcategoryParam}
        searchQuery={searchParam}
      />

      {(!products || products.length === 0) ? (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '48px 28px', textAlign: 'center', color: '#8a8478' }}>
          <p style={{ margin: '0 0 16px', fontSize: 15 }}>Aucun produit pour le moment.</p>
          <a href="/fr/admin/products/new" style={{ fontSize: 14, fontWeight: 600, color: '#c8643c', textDecoration: 'none' }}>Créer le premier produit →</a>
        </div>
      ) : (
        <div className="admin-table-scroll" style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['', 'Nom', 'Catégorie', 'Marque', 'Variantes', 'Statut', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i >= 4 && i < 6 ? 'center' : i === 6 ? 'right' : 'left', padding: i === 0 ? '14px 8px 14px 20px' : '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', background: '#faf9f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, idx: number) => {
                const primaryImage = p.product_images?.find((img: any) => img.is_primary) ?? p.product_images?.[0]
                return (
                <tr key={p.id} style={{ borderBottom: idx < products.length - 1 ? '1px solid #f4f2ec' : 'none' }}>
                  <td style={{ padding: '10px 8px 10px 20px' }}>
                    {primaryImage ? (
                      <img src={getThumbUrl(primaryImage.storage_path)} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid #ebe8e0', display: 'block' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f4f2ec' }} />
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#1c2230' }}>{p.name?.fr ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#6b6357' }}>{p.categories?.name?.fr ?? '—'}</td>
                  <td style={{ padding: '16px 20px', color: '#8a8478' }}>{p.brand ?? '—'}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center', color: '#6b6357', fontWeight: 600 }}>{p.product_variants?.length ?? 0}</td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: p.is_active ? '#e8f4e8' : '#f4f2ec', color: p.is_active ? '#2e7d32' : '#8a8478' }}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <a href={`/fr/admin/products/${p.id}/edit`} style={{ fontSize: 13, fontWeight: 600, color: '#1c2b46', textDecoration: 'none' }}>Modifier</a>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
