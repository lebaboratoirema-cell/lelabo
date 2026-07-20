import { createServiceClient } from '@/lib/supabase/service'
import DeleteBlogButton from './_components/DeleteBlogButton'
import type { BlogPost } from '@/types/database'

export default async function AdminBlogPage() {
  const supabase = createServiceClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (posts ?? []) as BlogPost[]

  return (
    <div className="admin-page-pad" style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>Blog</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>{rows.length} article{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <a
          href="/fr/admin/blog/new"
          style={{ height: 44, padding: '0 22px', border: 'none', borderRadius: 11, background: '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none', boxShadow: '0 4px 14px rgba(28,43,70,0.2)' }}
        >
          + Nouvel article
        </a>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#a8a294', fontSize: 14 }}>
          Aucun article — <a href="/fr/admin/blog/new" style={{ color: '#c8643c', textDecoration: 'none', fontWeight: 600 }}>Créer le premier</a>
        </div>
      ) : (
        <div className="admin-table-scroll" style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0ede5' }}>
                {['Titre', 'Slug', 'Statut', ''].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f7f5f1' : 'none' }}>
                  <td style={{ padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#1c2230' }}>
                    {p.title}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#6b6357' }}>
                    {p.slug}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: p.is_published ? '#edf7ed' : '#f5f4f0', color: p.is_published ? '#2e7d32' : '#8a8478' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.is_published ? '#43a047' : '#c5c0b5', display: 'inline-block' }} />
                      {p.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end' }}>
                      <a
                        href={`/fr/admin/blog/${p.id}/edit`}
                        style={{ height: 34, padding: '0 14px', border: '1px solid #dcd8cf', borderRadius: 9, background: '#fff', fontSize: 13, fontWeight: 600, color: '#1c2b46', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                      >
                        Modifier
                      </a>
                      <DeleteBlogButton id={p.id} />
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
