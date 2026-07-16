import type { BlogPost } from '@/types/database'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return <p className="empty-state">Aucun article pour l&apos;instant.</p>
  }

  return (
    <div className="product-grid">
      {posts.map((post) => (
        <a className="product-card reveal" href={`/fr/blog/${post.slug}`} key={post.id}>
          <div className="pimg">
            <img src={post.cover_image || '/images/hero-interior.webp'} alt={post.title} />
          </div>
          <div className="pbody">
            <span className="ref">{formatDate(post.published_at)}</span>
            <h3>{post.title}</h3>
            {post.excerpt && <p>{post.excerpt}</p>}
          </div>
        </a>
      ))}
    </div>
  )
}
