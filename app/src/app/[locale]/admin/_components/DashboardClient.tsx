'use client'

import { useState } from 'react'
import Link from 'next/link'

const RANGE_OPTS = ['7 j', '30 j', '12 m']

const SPARK_ACCENT = [40, 55, 48, 70, 62, 85, 92]
const SPARK_NEUTRAL = [50, 45, 60, 55, 72, 68, 80]

const KPIS = [
  { label: "Chiffre d'affaires", value: '312 480 MAD', delta: '+18,2%', up: true, spark: SPARK_ACCENT },
  { label: 'Commandes', value: '1 284', delta: '+9,4%', up: true, spark: SPARK_NEUTRAL },
  { label: 'Panier moyen', value: '243 MAD', delta: '+3,1%', up: true, spark: [60,58,65,62,70,66,74] },
  { label: 'Taux de retour', value: '2,8%', delta: '−0,6%', up: false, spark: [70,60,55,50,45,40,38] },
]

const TOP_PRODUCTS = [
  { name: 'Sérum éclat vitamine C', sold: 412, rev: '98 880 MAD' },
  { name: 'Crème hydratante nuit', sold: 318, rev: '76 320 MAD' },
  { name: 'Huile précieuse argan', sold: 264, rev: '52 800 MAD' },
  { name: 'Masque purifiant argile', sold: 197, rev: '33 490 MAD' },
]

const CHART = {
  cur:  [38,46,42,58,64,72,80,88],
  prev: [30,34,40,44,50,54,52,60],
  labels: ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû'],
}

type OrderStatus = 'Payée' | 'Expédiée' | 'En attente' | 'Annulée'
const STATUS_MAP: Record<OrderStatus, [string, string]> = {
  'Payée':      ['#3f8a5f', '#eaf4ee'],
  'Expédiée':   ['#2f6db0', '#e9f1fa'],
  'En attente': ['#b8862b', '#fbf3e2'],
  'Annulée':    ['#b5503a', '#fbeeea'],
}
const ORDERS: { id: string; client: string; date: string; total: string; status: OrderStatus }[] = [
  { id: '#LB-3041', client: 'Yasmine Bennani', date: '20 juin', total: '486 MAD',  status: 'Payée' },
  { id: '#LB-3040', client: 'Omar El Fassi',   date: '20 juin', total: '243 MAD',  status: 'Expédiée' },
  { id: '#LB-3039', client: 'Nadia Cherkaoui', date: '19 juin', total: '812 MAD',  status: 'En attente' },
  { id: '#LB-3038', client: 'Karim Idrissi',   date: '19 juin', total: '198 MAD',  status: 'Payée' },
  { id: '#LB-3037', client: 'Salma Tazi',       date: '18 juin', total: '359 MAD',  status: 'Annulée' },
]

type TopicKey = 'Produit' | 'Livraison' | 'Retour' | 'Grossiste'
const TOPIC_STYLE: Record<TopicKey, [string, string]> = {
  'Produit':   ['#2f6db0', '#e9f1fa'],
  'Livraison': ['#b8862b', '#fbf3e2'],
  'Retour':    ['#b5503a', '#fbeeea'],
  'Grossiste': ['#5a51a8', '#eeecf8'],
}
const AVATAR_BGS = ['#e4ddcf', '#e0e6e2', '#ece0d8', '#dfe3ec']
const RAW_INQUIRIES: { name: string; topic: TopicKey; message: string; time: string; unread: boolean }[] = [
  { name: 'Yasmine Bennani', topic: 'Produit',   message: 'Le sérum vitamine C convient-il aux peaux sensibles ? J\'hésite avant de commander.', time: 'il y a 12 min', unread: true },
  { name: 'Omar El Fassi',   topic: 'Livraison', message: 'Bonjour, ma commande #LB-3040 est-elle expédiée vers Agadir aujourd\'hui ?', time: 'il y a 40 min', unread: true },
  { name: 'Nadia Cherkaoui', topic: 'Grossiste', message: 'Proposez-vous des tarifs grossistes pour une pharmacie à Casablanca ?', time: 'il y a 2 h', unread: true },
  { name: 'Karim Idrissi',   topic: 'Retour',    message: 'Je souhaite retourner la crème de nuit, le flacon est arrivé endommagé.', time: 'Hier', unread: false },
]

export default function DashboardClient() {
  const [range, setRange] = useState(1)
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 32px 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 26 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'Spectral, serif', fontSize: 32, fontWeight: 600, letterSpacing: '-0.3px' }}>Bonjour, Salma</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#8a8478' }}>Voici l'activité de votre boutique — 20 juin 2026.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', background: '#fff', border: '1px solid #e6e3db', borderRadius: 11, padding: 3, fontSize: 13, fontWeight: 600 }}>
            {RANGE_OPTS.map((label, i) => (
              <button
                key={i}
                onClick={() => setRange(i)}
                style={{
                  height: 32, padding: '0 14px', border: 'none', borderRadius: 8,
                  background: range === i ? '#1c2b46' : 'transparent',
                  color: range === i ? '#fff' : '#8a8478',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                }}
              >
                {label}
              </button>
            ))}
          </div>
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

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 24 }}>
        {KPIS.map((k, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: 22, boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: '#8a8478' }}>{k.label}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: 12, fontWeight: 600,
                color: k.up ? '#3f8a5f' : '#b5503a',
                background: k.up ? '#eaf4ee' : '#fbeeea',
                padding: '3px 8px', borderRadius: 20,
              }}>{k.delta}</span>
            </div>
            <div style={{ fontFamily: 'Spectral, serif', fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>{k.value}</div>
            <div style={{ marginTop: 14, height: 34, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              {k.spark.map((h, j) => (
                <div key={j} style={{ flex: 1, height: h + '%', borderRadius: 3, background: (i === 0) ? '#c8643c' : '#d9d3c6' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Top products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 18, marginBottom: 24 }}>

        {/* Revenue chart */}
        <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Chiffre d'affaires</h2>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                <span style={{ fontFamily: 'Spectral, serif', fontSize: 26, fontWeight: 600 }}>312 480 MAD</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#3f8a5f' }}>+18,2%</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#8a8478' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: '#1c2b46', display: 'inline-block' }} />2026
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: '#e0c3b6', display: 'inline-block' }} />2025
              </span>
            </div>
          </div>
          <div style={{ marginTop: 18, height: 200, display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            {CHART.cur.map((c, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, height: '100%' }}>
                <div style={{ width: '36%', height: CHART.prev[i] + '%', borderRadius: '5px 5px 0 0', background: '#e8d3c8' }} />
                <div style={{ width: '36%', height: c + '%', borderRadius: '5px 5px 0 0', background: '#1c2b46' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11, color: '#a8a294' }}>
            {CHART.labels.map(l => <span key={l}>{l}</span>)}
          </div>
        </section>

        {/* Top products */}
        <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Meilleures ventes</h2>
            <Link href="/fr/admin/products" style={{ fontSize: 12, color: '#c8643c', fontWeight: 600, textDecoration: 'none' }}>Tout voir</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_PRODUCTS.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                  background: 'repeating-linear-gradient(45deg,#f3f1ea,#f3f1ea 6px,#ece9df 6px,#ece9df 12px)',
                  border: '1px solid #ece9e1',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#a8a294', marginTop: 2 }}>{p.sold} vendus</div>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: 'Spectral, serif' }}>{p.rev}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Inquiries */}
      <section style={{ background: '#fff', border: '1px solid #ebe8e0', borderRadius: 16, padding: '24px 26px', boxShadow: '0 1px 2px rgba(28,34,48,0.04)', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Demandes clients</h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#c8643c', background: '#fdf0ea', padding: '2px 9px', borderRadius: 20 }}>
              {RAW_INQUIRIES.filter(q => q.unread).length} non lues
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#c8643c', fontWeight: 600, cursor: 'pointer' }}>Boîte de réception</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {RAW_INQUIRIES.map((q, i) => {
            const [tagColor, tagBg] = TOPIC_STYLE[q.topic]
            const open = expanded === i
            return (
              <div
                key={i}
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '15px 8px', borderBottom: '1px solid #f5f3ed',
                  cursor: 'pointer',
                  background: q.unread ? '#fdfbf7' : 'transparent',
                  borderRadius: 10,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: AVATAR_BGS[i % AVATAR_BGS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#6b6357',
                }}>
                  {q.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: q.unread ? 700 : 600 }}>{q.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: tagColor, background: tagBg, padding: '2px 8px', borderRadius: 6 }}>{q.topic}</span>
                    {q.unread && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c8643c', display: 'inline-block' }} />}
                  </div>
                  <div style={{
                    fontSize: 13, color: '#7a7568', marginTop: 4, lineHeight: 1.5,
                    whiteSpace: open ? 'normal' : 'nowrap',
                    overflow: open ? 'visible' : 'hidden',
                    textOverflow: open ? 'unset' : 'ellipsis',
                  }}>
                    {q.message}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#a8a294', flexShrink: 0, whiteSpace: 'nowrap' }}>{q.time}</span>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 0.9fr', gap: 12, padding: '0 6px 12px', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#a8a294', borderBottom: '1px solid #f0ede5' }}>
          <span>Commande</span><span>Client</span><span>Date</span><span>Statut</span><span style={{ textAlign: 'right' }}>Total</span>
        </div>
        {ORDERS.map((o, i) => {
          const [statusColor, statusBg] = STATUS_MAP[o.status]
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.9fr 0.9fr', gap: 12, padding: '14px 6px', alignItems: 'center', borderBottom: '1px solid #f5f3ed', fontSize: 13.5 }}>
              <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#1c2b46' }}>{o.id}</span>
              <span>{o.client}</span>
              <span style={{ color: '#8a8478' }}>{o.date}</span>
              <span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: statusColor, background: statusBg, padding: '4px 10px', borderRadius: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                  {o.status}
                </span>
              </span>
              <span style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'Spectral, serif' }}>{o.total}</span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
