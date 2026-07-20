'use server'

import { Resend } from 'resend'

export interface QuotePayload {
  productName: string
  variantName?: string
  name: string
  email: string
  phone?: string
  message: string
}

export interface QuoteResult {
  success: boolean
  error?: string
}

async function saveToAirtable(payload: QuotePayload) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_DEVIS_TABLE } = process.env
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_DEVIS_TABLE) return

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_DEVIS_TABLE)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          Nom: payload.name,
          Email: payload.email,
          Telephone: payload.phone ?? '',
          Produit: payload.productName,
          Variante: payload.variantName ?? '',
          Message: payload.message,
          Statut: 'Nouveau',
          Date: new Date().toISOString(),
        },
      }),
    }
  )

  if (!res.ok) {
    throw new Error(`Airtable error: ${res.status} ${await res.text()}`)
  }
}

async function notifyByEmail(payload: QuotePayload) {
  const { RESEND_API_KEY, DEVIS_NOTIFY_EMAIL } = process.env
  if (!RESEND_API_KEY || !DEVIS_NOTIFY_EMAIL) return

  const resend = new Resend(RESEND_API_KEY)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email?.trim() ?? '')
  const { error } = await resend.emails.send({
    from: 'Devis lelaboratoire.ma <onboarding@resend.dev>',
    to: DEVIS_NOTIFY_EMAIL,
    ...(isValidEmail ? { replyTo: payload.email.trim() } : {}),
    subject: `Nouvelle demande de devis — ${payload.productName}`,
    text: [
      `Produit: ${payload.productName}${payload.variantName ? ` — ${payload.variantName}` : ''}`,
      `Nom: ${payload.name}`,
      `Email: ${payload.email}`,
      `Téléphone: ${payload.phone ?? '—'}`,
      '',
      'Message:',
      payload.message,
    ].join('\n'),
  })
  if (error) {
    throw new Error(`Resend error: ${error.name} ${error.message}`)
  }
}

export async function submitQuote(payload: QuotePayload): Promise<QuoteResult> {
  try {
    const results = await Promise.allSettled([saveToAirtable(payload), notifyByEmail(payload)])
    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) {
      failed.forEach((r) => console.error('[QUOTE ERROR]', (r as PromiseRejectedResult).reason))
    }
    if (failed.length === results.length) {
      return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
    }
    return { success: true }
  } catch (err) {
    console.error('[QUOTE ERROR]', err)
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}
