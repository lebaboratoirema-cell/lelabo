import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/supabase/queries'

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim()
  if (q.length < 2) return NextResponse.json({ results: [] })

  const products = await searchProducts(q)
  const results = products.slice(0, 8).map((p) => {
    const primary = p.product_images.find((img) => img.is_primary) ?? p.product_images[0]
    return {
      id: p.id,
      name: p.name.fr,
      slug: p.slug,
      href: `${p.basePath}/${p.slug}`,
      image: primary ? primary.storage_path : null,
    }
  })

  return NextResponse.json({ results })
}
