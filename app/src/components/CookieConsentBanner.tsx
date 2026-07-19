"use client";

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

const STORAGE_KEY = 'cookie_consent';

const TEXT = {
  fr: {
    message:
      "Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, pour améliorer votre expérience.",
    link: 'Politique de confidentialité',
    accept: 'Accepter',
    reject: 'Refuser',
  },
  en: {
    message:
      'We use cookies required for the site to work and, with your consent, to improve your experience.',
    link: 'Privacy policy',
    accept: 'Accept',
    reject: 'Reject',
  },
};

export default function CookieConsentBanner() {
  const locale = useLocale();
  const t = locale === 'en' ? TEXT.en : TEXT.fr;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function choose(choice: 'accepted' | 'rejected') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, ts: Date.now() }));
    setVisible(false);

    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choice, locale }),
    }).catch(() => {});

    // No analytics/marketing cookies exist yet — hook point for when they're added:
    // if (choice === 'accepted') { /* load analytics script */ }
  }

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="wrap cookie-banner-inner">
        <p>
          {t.message} <a href={`/${locale}/confidentialite`}>{t.link}</a>
        </p>
        <div className="cookie-banner-actions">
          <button type="button" className="btn btn-sm" onClick={() => choose('accepted')}>
            {t.accept}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => choose('rejected')}>
            {t.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
