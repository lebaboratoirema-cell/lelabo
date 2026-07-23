"use client";

import { useEffect, useState } from 'react';
import { GoogleTagManager } from '@next/third-parties/google';
import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from '@/lib/cookieConsent';

export default function Analytics() {
  const [allowed, setAllowed] = useState(false);
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    setAllowed(hasAnalyticsConsent());
    const onChange = () => setAllowed(hasAnalyticsConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  if (!gtmId || !allowed) return null;
  return <GoogleTagManager gtmId={gtmId} />;
}
