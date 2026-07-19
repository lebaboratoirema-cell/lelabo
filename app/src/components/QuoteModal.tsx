'use client'

import { useState, useTransition } from 'react'
import { submitQuote } from '@/app/actions/quote'

interface Props {
  productName: string
  variantName?: string
}

export default function QuoteModal({ productName, variantName }: Props) {
  const [open, setOpen] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultMessage = variantName
    ? `Je souhaite un devis pour : ${productName} — ${variantName}`
    : `Je souhaite un devis pour : ${productName}`

  function openModal() {
    setOpen(true)
    setSuccess(false)
    setError(null)
  }

  function closeModal() {
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      const result = await submitQuote({
        productName,
        variantName,
        name: data.get('name') as string,
        email: data.get('email') as string,
        phone: (data.get('phone') as string) || undefined,
        message: data.get('message') as string,
      })

      if (result.success) {
        setSuccess(true)
        setTimeout(() => setOpen(false), 3000)
      } else {
        setError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  return (
    <>
      <button className="btn btn-quote" onClick={openModal}>
        Demander un devis
      </button>

      {open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="modal-box">
            <button className="modal-close" onClick={closeModal} aria-label="Fermer">&times;</button>
            <h2 className="modal-title">Demander un devis</h2>
            <p className="modal-product">{productName}{variantName ? ` — ${variantName}` : ''}</p>

            {success ? (
              <div className="modal-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40"><path d="M20 6L9 17l-5-5"/></svg>
                <p>Votre demande a été envoyée. Nous vous contacterons rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <label>
                  Nom complet <span aria-hidden>*</span>
                  <input name="name" type="text" required placeholder="Votre nom" />
                </label>
                <label>
                  Email <span aria-hidden>*</span>
                  <input name="email" type="email" required placeholder="votre@email.com" />
                </label>
                <label>
                  Téléphone
                  <input name="phone" type="tel" placeholder="+212 6XX XXX XXX" />
                </label>
                <label>
                  Message
                  <textarea name="message" rows={3} defaultValue={defaultMessage} />
                </label>
                {error && <p className="modal-error">{error}</p>}
                <button type="submit" className="btn btn-quote" disabled={isPending}>
                  {isPending ? 'Envoi…' : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
