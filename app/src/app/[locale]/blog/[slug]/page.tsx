import { notFound } from 'next/navigation'
import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import { getBlogPostBySlug } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src={post.cover_image || '/images/hero-interior.webp'} alt="" />
        <div className="wrap">
          <h1>{post.title}</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            <a href="/fr/blog">Blog</a>
            <span className="sep">/</span>
            {post.title}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap" style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>{formatDate(post.published_at)}</p>
          {post.content.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{ marginBottom: 18, lineHeight: 1.7 }}>{para}</p>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
