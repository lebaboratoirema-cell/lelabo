'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { OrderStatus } from '@/types/database'
import type { DashboardData } from '../_lib/dashboardData'

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}
const STATUS_STYLE: Record<OrderStatus, [string, string]> = {
  pending: ['#b8862b', '#fbf3e2'],
  confirmed: ['#2f6db0', '#e9f1fa'],
  processing: ['#2f6db0', '#e9f1fa'],
  shipped: ['#2f6db0', '#e9f1fa'],
  delivered: ['#3f8a5f', '#eaf4ee'],
  cancelled: ['#b5503a', '#fbeeea'],
}

function formatMAD(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR')} MAD`
}

function formatDevisDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

type DevisRange = 'today' | '7d' | 'month' | '6m' | '1y' | 'all'

const DEVIS_RANGE_LABEL: Record<DevisRange, string> = {
  today: "Aujourd'hui",
  '7d': '7 jours',
  month: '1 mois',
  '6m': '6 mois',
  '1y': '1 an',
  all: 'Tout',
}

function isWithinRange(iso: string, range: DevisRange): boolean {
  if (range === 'all') return true
  if (!iso) return false
  const d = new Date(iso)
  if (isNaN(d.getTime())) return false
  const now = new Date()

  if (range === 'today') {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()
  }

  const since = new Date(now)
  if (range === '7d') since.setDate(now.getDate() - 7)
  else if (range === 'month') since.setMonth(now.getMonth() - 1)
  else if (range === '6m') since.setMonth(now.getMonth() - 6)
  else if (range === '1y') since.setFullYear(now.getFullYear() - 1)
  return d >= since
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [openFamily, setOpenFamily] = useState<string | null>(null)
  const [openDevis, setOpenDevis] = useState<string | null>(null)
  const [devisRange, setDevisRange] = useState<DevisRange>('all')
  const { recentOrders, catalogue, devis, devisList: allDevisList } = data
  const devisList = allDevisList.filter((d) => isWithinRange(d.date, devisRange))

  return (
    <div className="admin-page-pad">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>Tableau de bord</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>
            {devis.total} demande{devis.total !== 1 ? 's' : ''} de devis reçue{devis.total !== 1 ? 's' : ''}
            {devis.nouveaux > 0 && (
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, color: '#c8643c', background: '#fdf0ea', padding: '2px 9px', borderRadius: 20 }}>
                {devis.nouveaux} nouvelle{devis.nouveaux > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/fr/admin/products/new" style={{ textDecoration: 'none' }}>
            <button style={{
              height: 40, padding: '0 18px', border: 'none', borderRadius: 11,
              background: '#1c2b46', color: '#fff', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(28,43,70,0.22)',
            }}>
              + Nouveau produit
            </button>
          </Link>
        </div>
      </div>

      {/* Devis */}
      <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Demandes de devis</h2>
            {devis.nouveaux > 0 && (
              <span style={{ fontSize: 12, fontWeight: 600, color: '#c8643c', background: '#fdf0ea', padding: '2px 9px', borderRadius: 20 }}>
                {devis.nouveaux} nouvelle{devis.nouveaux > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#faf9f6', border: '1px solid #f0ede5', borderRadius: 10, padding: 3 }}>
            {(Object.keys(DEVIS_RANGE_LABEL) as DevisRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setDevisRange(r)}
                style={{
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600,
                  padding: '6px 12px', borderRadius: 8,
                  background: devisRange === r ? '#1c2b46' : 'transparent',
                  color: devisRange === r ? '#fff' : '#6b6357',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {DEVIS_RANGE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
        {devisList.length === 0 ? (
          <p style={{ fontSize: 13, color: '#a8a294', margin: 0 }}>
            {allDevisList.length === 0 ? 'Aucune demande de devis pour le moment.' : 'Aucune demande sur cette période.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {devisList.map((d) => {
              const open = openDevis === d.id
              return (
                <div
                  key={d.id}
                  onClick={() => setOpenDevis(open ? null : d.id)}
                  style={{
                    padding: '15px 8px', borderBottom: '1px solid #f5f3ed', cursor: 'pointer',
                    background: d.status === 'Nouveau' ? '#fdfbf7' : 'transparent', borderRadius: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 13.5, fontWeight: d.status === 'Nouveau' ? 700 : 600 }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: '#8a8478', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.product}</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#a8a294', flexShrink: 0 }}>{formatDevisDate(d.date)}</span>
                  </div>
                  <div style={{
                    fontSize: 13, color: '#7a7568', marginTop: 6, lineHeight: 1.5,
                    whiteSpace: open ? 'normal' : 'nowrap',
                    overflow: open ? 'visible' : 'hidden',
                    textOverflow: open ? 'unset' : 'ellipsis',
                  }}>
                    {d.message}
                  </div>
                  {open && (
                    <div style={{ marginTop: 10, display: 'flex', gap: 16, fontSize: 12.5, color: '#6b6357' }}>
                      <span>{d.email}</span>
                      {d.phone !== '—' && <span>{d.phone}</span>}
                      {d.variant && <span>{d.variant}</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Catalogue */}
      <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Catalogue</h2>
          <Link href="/fr/admin/categories" style={{ fontSize: 12, color: '#c8643c', fontWeight: 600, textDecoration: 'none' }}>Gérer les catégories</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {catalogue.map((f) => {
            const open = openFamily === f.slug
            return (
              <div key={f.slug} style={{ border: '1px solid #f0ede5', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFamily(open ? null : f.slug)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1c2230' }}>{f.name}</span>
                    <span style={{ fontSize: 12, color: '#a8a294' }}>{f.subcategoryCount} sous-catégories</span>
                    {f.emptySubcategoryCount > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#b5503a', background: '#fbeeea', padding: '2px 8px', borderRadius: 20 }}>
                        {f.emptySubcategoryCount} vide{f.emptySubcategoryCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontFamily: 'Spectral, serif', fontSize: 20, fontWeight: 600 }}>{f.activeProducts}</span>
                    <span style={{ fontSize: 12, color: '#a8a294', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▾</span>
                  </div>
                </button>
                {open && (
                  <div style={{ borderTop: '1px solid #f0ede5', maxHeight: 360, overflowY: 'auto' }}>
                    {f.subcategories.length === 0 ? (
                      <p style={{ padding: '14px 16px', margin: 0, fontSize: 13, color: '#a8a294' }}>Aucune sous-catégorie.</p>
                    ) : (
                      f.subcategories.map((s, i) => (
                        <div
                          key={s.slug}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 16px', fontSize: 13,
                            borderTop: i === 0 ? 'none' : '1px solid #f5f3ed',
                            background: s.activeProducts === 0 ? '#fdfaf8' : 'transparent',
                          }}
                        >
                          <span style={{ color: s.activeProducts === 0 ? '#b5503a' : '#1c2230' }}>{s.name}</span>
                          <span style={{ fontWeight: 600, color: s.activeProducts === 0 ? '#b5503a' : '#6b6357' }}>{s.activeProducts}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent orders */}
      <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Commandes récentes</h2>
          <span style={{ fontSize: 12, color: '#c8643c', fontWeight: 600, cursor: 'pointer' }}>Voir toutes les commandes</span>
        </div>
        {recentOrders.length === 0 ? (
          <p style={{ fontSize: 13, color: '#a8a294', margin: 0 }}>Aucune commande pour le moment.</p>
        ) : (
        <div className="admin-table-scroll">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 0.9fr', gap: 12, padding: '0 6px 12px', minWidth: 560, fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', borderBottom: '1px solid #f0ede5' }}>
          <span>Commande</span><span>Client</span><span>Date</span><span>Statut</span><span style={{ textAlign: 'right' }}>Total</span>
        </div>
        {recentOrders.map((o) => {
          const [statusColor, statusBg] = STATUS_STYLE[o.status]
          return (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 0.9fr', gap: 12, padding: '14px 6px', minWidth: 560, alignItems: 'center', borderBottom: '1px solid #f5f3ed', fontSize: 13.5 }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#1c2b46' }}>{o.reference}</span>
              <span>{o.customerName}</span>
              <span style={{ color: '#8a8478' }}>{o.date}</span>
              <span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: statusColor, background: statusBg, padding: '4px 10px', borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                  {STATUS_LABEL[o.status]}
                </span>
              </span>
              <span style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'Spectral, serif' }}>{formatMAD(o.total)}</span>
            </div>
          )
        })}
        </div>
        )}
      </section>
    </div>
  )
}
