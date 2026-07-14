import TopBar from '@/components/TopBar'
import Header from '@/components/Header'
import SiteFooter from '@/components/SiteFooter'
import ScrollReveal from '@/components/ScrollReveal'
import BlogGrid from '@/components/BlogGrid'
import { getBlogPosts } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const posts = await getBlogPosts()

  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-interior.webp" alt="" />
        <div className="wrap">
          <h1>Blog</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Blog
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <BlogGrid posts={posts} />
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
