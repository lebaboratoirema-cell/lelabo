import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

// Prevents </script> in admin-authored content from breaking out of the JSON-LD block.
function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) return {}

  const description = post.meta_description || post.excerpt || undefined
  const image = post.cover_image || '/images/hero-interior.webp'

  return {
    title: `${post.title} | lelaboratoire.ma`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: [post.author],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [image],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image || undefined,
    datePublished: post.published_at || undefined,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: post.author },
    publisher: { '@type': 'Organization', name: 'lelaboratoire.ma' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://lelaboratoire.ma/fr/blog/${post.slug}` },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
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
          <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 24 }}>
            {formatDate(post.published_at)} — {post.author}
          </p>
          <div className="blog-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
