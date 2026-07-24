'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { SearchResult } from '@/lib/supabase/queries'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getImageUrl(storagePath: string): string {
  return `${supabaseUrl}/storage/v1/render/image/public/product-images/${storagePath}?width=320&height=320&resize=cover&quality=70`
}

export default function ProductCarousel({ products }: { products: SearchResult[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    requestAnimationFrame(() => {
      const el = trackRef.current
      if (!el) return
      setAtStart(el.scrollLeft <= 4)
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    })
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.featured-item')
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const el = trackRef.current
      if (!el) return
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollByCard(1)
      }
    }, 5000)
    return () => clearInterval(id)
  }, [paused])

  return (
    <div
      className="featured-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="carousel-nav">
        <button
          type="button"
          className="carousel-arrow"
          onClick={() => { setPaused(true); scrollByCard(-1); }}
          disabled={atStart}
          aria-label="Produit précédent"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button
          type="button"
          className="carousel-arrow"
          onClick={() => { setPaused(true); scrollByCard(1); }}
          disabled={atEnd}
          aria-label="Produit suivant"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>

      <div className="featured-row" ref={trackRef}>
        {products.map((p) => {
          const primaryImage = p.product_images.find((img) => img.is_primary) ?? p.product_images[0]
          const imgSrc = primaryImage ? getImageUrl(primaryImage.storage_path) : '/images/glassware.webp'
          const href = `${p.basePath}/${p.slug}`

          return (
            <a className="featured-item" href={href} key={p.id}>
              <div className="pimg">
                {p.promo_label && <span className="promo-badge">{p.promo_label}</span>}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc} alt={(p.name as { fr: string }).fr} loading="lazy" />
                <span className="stock-badge">
                  <span className="sdot" style={{ background: p.in_stock ? '#16a34a' : '#9ca3af' }} />
                  {p.in_stock ? 'En stock' : 'Sur commande'}
                </span>
              </div>
              <h3>{(p.name as { fr: string }).fr}</h3>
            </a>
          )
        })}
      </div>
    </div>
  )
}
