'use client'

import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()

  function linkStyle(href: string): React.CSSProperties {
    const active = pathname.startsWith(href)
    return {
      color: active ? '#1c2b46' : '#9aa3af',
      fontWeight: active ? 600 : 400,
      textDecoration: 'none',
      position: 'relative',
    }
  }

  function underline(href: string): React.CSSProperties {
    return {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -21,
      height: 2,
      background: '#c8643c',
      borderRadius: 2,
      display: pathname.startsWith(href) ? 'block' : 'none',
    }
  }

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 14 }}>
      <a href="/fr/admin" style={{ color: pathname === '/fr/admin' ? '#1c2b46' : '#9aa3af', fontWeight: pathname === '/fr/admin' ? 600 : 400, textDecoration: 'none', position: 'relative' }}>
        Tableau de bord
        <span style={{ position: 'absolute', left: 0, right: 0, bottom: -21, height: 2, background: '#c8643c', borderRadius: 2, display: pathname === '/fr/admin' ? 'block' : 'none' }} />
      </a>
      <a href="/fr/admin/products" style={linkStyle('/fr/admin/products')}>
        Produits
        <span style={underline('/fr/admin/products')} />
      </a>
      <a href="/fr/admin/categories" style={linkStyle('/fr/admin/categories')}>
        Catégories
        <span style={underline('/fr/admin/categories')} />
      </a>
      <span style={{ color: '#9aa3af', cursor: 'not-allowed' }}>Commandes</span>
      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e2ddd2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#6b6357' }}>SA</div>
    </nav>
  )
}
