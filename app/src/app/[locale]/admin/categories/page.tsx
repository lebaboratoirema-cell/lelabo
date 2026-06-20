import { createServiceClient } from '@/lib/supabase/service'
import DeleteCategoryButton from './_components/DeleteCategoryButton'
import type { Category } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = createServiceClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position')
    .order('created_at')

  const rows = (categories ?? []) as Category[]
  const parentMap = new Map(rows.map((c) => [c.id, (c.name as { fr: string }).fr]))

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px', color: '#1c2230' }}>Catégories</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>{rows.length} catégorie{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <a
          href="/fr/admin/categories/new"
          style={{ height: 44, padding: '0 22px', border: 'none', borderRadius: 11, background: '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 4px 14px rgba(28,43,70,0.2)' }}
        >
          + Nouvelle catégorie
        </a>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#a8a294', fontSize: 14 }}>
          Aucune catégorie — <a href="/fr/admin/categories/new" style={{ color: '#c8643c', textDecoration: 'none', fontWeight: 600 }}>Créer la première</a>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['Nom', 'Slug', 'Parente', 'Statut', ''].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', background: '#faf9f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f7f5f1' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1c2230' }}>
                    {(c.name as { fr: string }).fr}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#6b6357' }}>
                    {c.slug}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: '#8a8478' }}>
                    {c.parent_id ? parentMap.get(c.parent_id) ?? '—' : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: c.is_active ? '#edf7ed' : '#f5f4f0', color: c.is_active ? '#2e7d32' : '#8a8478' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.is_active ? '#43a047' : '#c5c0b5', display: 'inline-block' }} />
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <a
                        href={`/fr/admin/categories/${c.id}/edit`}
                        style={{ height: 34, padding: '0 14px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 600, color: '#1c2b46', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        Modifier
                      </a>
                      <DeleteCategoryButton id={c.id} />
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
