export const CONSENT_STORAGE_KEY = 'cookie_consent';
export const CONSENT_CHANGE_EVENT = 'cookie-consent-changed';

export type ConsentChoice = 'accepted' | 'rejected';

export function getConsentChoice(): ConsentChoice | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored).choice ?? null;
  } catch {
    return null;
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsentChoice() === 'accepted';
}
