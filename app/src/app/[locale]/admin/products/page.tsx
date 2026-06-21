import { createServiceClient } from '@/lib/supabase/service'
import type { Category } from '@/types/database'
import DeleteButton from './_components/DeleteButton'
import FilterBar from './_components/FilterBar'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; subcategory?: string }
}) {
  const supabase = createServiceClient()

  const { data: allCats } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('position')

  const parents = ((allCats ?? []) as Category[]).filter((c) => !c.parent_id)
  const childCategories = ((allCats ?? []) as Category[]).filter((c) => !!c.parent_id)

  const categoryParam = searchParams.category ?? ''
  const subcategoryParam = searchParams.subcategory ?? ''

  let query = supabase
    .from('products')
    .select('*, categories(name), product_variants(id)')
    .order('created_at', { ascending: false })

  if (subcategoryParam) {
    query = query.eq('category_id', subcategoryParam)
  } else if (categoryParam) {
    const childIds = childCategories
      .filter((c) => c.parent_id === categoryParam)
      .map((c) => c.id)
    query = query.in('category_id', [categoryParam, ...childIds])
  }

  const { data: products } = await query

  return (
    <div style={{ padding: '32px 32px 80px' }}>
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
      />

      {(!products || products.length === 0) ? (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '48px 28px', textAlign: 'center', color: '#8a8478' }}>
          <p style={{ margin: '0 0 16px', fontSize: 15 }}>Aucun produit pour le moment.</p>
          <a href="/fr/admin/products/new" style={{ fontSize: 14, fontWeight: 600, color: '#c8643c', textDecoration: 'none' }}>Créer le premier produit →</a>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['Nom', 'Catégorie', 'Marque', 'Variantes', 'Statut', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i >= 3 && i < 5 ? 'center' : i === 5 ? 'right' : 'left', padding: '14px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', background: '#faf9f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, idx: number) => (
                <tr key={p.id} style={{ borderBottom: idx < products.length - 1 ? '1px solid #f4f2ec' : 'none' }}>
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
