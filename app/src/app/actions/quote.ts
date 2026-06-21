'use server'

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

export async function submitQuote(payload: QuotePayload): Promise<QuoteResult> {
  try {
    console.log('[QUOTE REQUEST]', {
      product: payload.productName,
      variant: payload.variantName ?? '—',
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? '—',
      message: payload.message,
      timestamp: new Date().toISOString(),
    })
    return { success: true }
  } catch (err) {
    console.error('[QUOTE ERROR]', err)
    return { success: false, error: 'Une erreur est survenue. Veuillez réessayer.' }
  }
}
