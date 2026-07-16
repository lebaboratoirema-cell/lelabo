'use client'

import { useState } from 'react'
import type { BlogPost } from '@/types/database'
import { createBlogPost, updateBlogPost } from './actions'

interface Props {
  post?: BlogPost
}

export default function BlogForm({ post }: Props) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')
  const [author, setAuthor] = useState(post?.author ?? 'lelaboratoire.ma')
  const [metaDescription, setMetaDescription] = useState(post?.meta_description ?? '')
  const [published, setPublished] = useState(post?.is_published ?? false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const fd = new FormData(e.currentTarget)
      fd.set('title', title)
      fd.set('excerpt', excerpt)
      fd.set('content', content)
      fd.set('cover_image', coverImage)
      fd.set('author', author)
      fd.set('meta_description', metaDescription)
      fd.set('is_published', published ? 'on' : '')
      if (post) {
        await updateBlogPost(post.id, fd)
      } else {
        await createBlogPost(fd)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #ebe8e0',
    borderRadius: 16,
    padding: '26px 28px',
    boxShadow: '0 1px 2px rgba(28,34,48,0.04)',
  }
  const label: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 7,
    color: '#3a4150',
  }
  const inp: React.CSSProperties = {
    padding: '12px 14px',
    border: '1px solid #dcd8cf',
    borderRadius: 10,
    background: '#fcfbf9',
    fontSize: 14,
    color: '#1c2230',
    fontFamily: 'inherit',
    width: '100%',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 32px 100px' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#9aa3af', marginBottom: 10 }}>
            <a href="/fr/admin/blog" style={{ color: '#9aa3af', textDecoration: 'none' }}>Blog</a>
            <span>›</span>
            <span style={{ color: '#6b6357' }}>{post ? 'Modifier' : 'Nouvel'}</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>
            {post ? "Modifier l'article" : 'Nouvel article'}
          </h1>
        </div>

        {error && (
          <div style={{ background: '#fdf1ed', border: '1px solid #e6c3b8', color: '#b5503a', borderRadius: 10, padding: '12px 16px', fontSize: 14, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <section style={{ ...card, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={label}>Titre <span style={{ color: '#c8643c' }}>*</span></label>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex. Comment choisir sa verrerie" className="admin-input" style={{ ...inp, height: 44 }} />
          </div>

          <div>
            <label style={label}>Image de couverture (URL)</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" className="admin-input" style={{ ...inp, height: 44 }} />
          </div>

          <div>
            <label style={label}>Auteur</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="lelaboratoire.ma" className="admin-input" style={{ ...inp, height: 44 }} />
          </div>

          <div>
            <label style={label}>Extrait</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Résumé court affiché dans la liste" className="admin-input" style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div>
            <label style={label}>Description meta (SEO, 150-160 caractères)</label>
            <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows={2} placeholder="Affichée dans les résultats Google et les partages sociaux" className="admin-input" style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div>
            <label style={label}>Contenu (Markdown) <span style={{ color: '#c8643c' }}>*</span></label>
            <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={20} placeholder="## Titre de section&#10;&#10;Paragraphe avec [lien](/lab-equipment)." className="admin-input" style={{ ...inp, resize: 'vertical', fontFamily: 'monospace' }} />
          </div>

          <div>
            <label style={label}>Statut</label>
            <div
              onClick={() => setPublished((p) => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', width: 'fit-content' }}
            >
              <div style={{ width: 46, height: 26, borderRadius: 13, background: published ? '#1c2b46' : '#d4d0c6', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: published ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{published ? 'Publié' : 'Brouillon'}</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid #e6e3db' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#a8a294' }}>Les champs marqués <span style={{ color: '#c8643c' }}>*</span> sont obligatoires.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/fr/admin/blog" className="admin-btn-ghost" style={{ height: 44, padding: '0 22px', border: '1px solid #dcd8cf', borderRadius: 11, background: '#fff', fontSize: 14, fontWeight: 600, color: '#6b6357', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>Annuler</a>
            <button
              type="submit"
              disabled={loading}
              style={{ height: 44, padding: '0 26px', border: 'none', borderRadius: 11, background: loading ? '#8a95a8' : '#1c2b46', fontSize: 14, fontWeight: 600, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(28,43,70,0.25)' }}
            >
              {loading ? 'Enregistrement…' : post ? 'Mettre à jour' : "Créer l'article"}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
