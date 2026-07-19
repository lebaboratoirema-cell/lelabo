# Cookie Consent Banner — CNDP (Maroc) & GDPR (EU) — Design

## Purpose
Add a cookie consent banner so lelaboratoire.ma collects demonstrable, auditable consent before setting any non-essential cookie, satisfying both Moroccan Law 09-08 (CNDP) and EU GDPR for EU visitors.

## Scope decisions
- **Consent model**: Accept all / Reject all (no granular category toggles). Site currently has no analytics/marketing trackers, so a single binary choice covers "necessary only" vs "everything".
- **Proof of consent**: logged server-side to Supabase (`cookie_consents` table), not just localStorage, so there is an audit trail if CNDP or a GDPR regulator asks for evidence.
- **UX**: non-blocking bottom bar, site fully usable behind it. Matches existing SiteFooter/TopBar visual language.
- **Privacy page**: a new minimal `/confidentialite` page is created since none exists; the banner links to it (required reference for both regimes).

## Data model
New migration `supabase/migrations/006_cookie_consents.sql`:

```sql
create table cookie_consents (
  id          uuid primary key default gen_random_uuid(),
  choice      text not null check (choice in ('accepted','rejected')),
  locale      text not null,
  ip_hash     text not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table cookie_consents enable row level security;

create policy "anon can insert own consent"
  on cookie_consents for insert
  to anon
  with check (true);
```

No `select` policy for `anon` — consent records are write-only from the client; only service-role (admin/back office) can read them later if needed.

IP is never stored raw. The API route hashes it (SHA-256 + a server-side secret pepper) before insert, satisfying data-minimization principle under both regimes.

## API route
`src/app/api/consent/route.ts` — `POST` handler.

Request body: `{ choice: 'accepted' | 'rejected', locale: string }`.

Behavior:
1. Read client IP from `x-forwarded-for` header (first value) or fall back to `'unknown'`.
2. Hash IP with SHA-256 + `process.env.CONSENT_IP_PEPPER` (new env var, add to `.env.example`, never commit real value).
3. Insert row into `cookie_consents` via `createClient()` (existing anon server client from `src/lib/supabase/server.ts`), relying on the RLS insert policy above.
4. Return `{ ok: true }` (200) or `{ ok: false }` (500) on failure. Failure must never block the UI — banner already hid itself optimistically once localStorage is written.

No GET/read endpoint is exposed publicly.

## Component
`src/components/CookieConsentBanner.tsx` — client component (`"use client"`), following the existing pattern used by `SiteFooter.tsx` / `TopBar.tsx`.

Behavior:
- On mount, `useEffect` reads `localStorage.getItem('cookie_consent')`. If a value already exists (`'accepted'` or `'rejected'`), the banner never renders.
- If absent, renders a fixed-position bottom bar: short explanatory text (locale-aware via next-intl `useTranslations`), a link to `/confidentialite`, and two buttons — Accept / Reject — styled with the existing `.btn` class and site color variables (`--teal-bright` etc.), consistent with `SiteFooter`.
- On button click: write `localStorage.setItem('cookie_consent', JSON.stringify({ choice, ts: Date.now() }))`, fire a fire-and-forget `fetch('/api/consent', { method: 'POST', body: ... })` (errors swallowed — this must never surface to the user or block dismissal), and hide the banner immediately (local state, no reload).
- No cookies/analytics scripts exist yet to gate behind the "accepted" branch — this is intentionally left as a no-op hook point (a `if (choice === 'accepted')` comment marker) for when analytics is added later, not implemented now (YAGNI — nothing to gate today).

## Mounting
Add `<CookieConsentBanner />` inside `<body>` in `src/app/[locale]/layout.tsx`, after `{children}`, so it overlays on every locale route without needing to be added per-page.

## Privacy page
`src/app/[locale]/confidentialite/page.tsx` — static server component, no data fetching. Content (fr primary, en via next-intl):
- What is collected on consent (choice, locale, hashed IP, timestamp, user agent) and why (legal proof of consent).
- That today the site sets no analytics/marketing cookies — only functional/necessary ones (session, cart).
- Retention note (consent records kept indefinitely as compliance evidence, no personal profile built from them).
- Contact email (`contact@lelaboratoire.ma`, already used in `SiteFooter`) for data-subject rights requests (access/deletion), required by both Law 09-08 and GDPR Art. 15-17.

Route naming: `/confidentialite` for `fr`, next-intl locale routing handles the `/en/confidentialite` prefix automatically (matches existing routing convention — no per-locale slug translation elsewhere in the app, e.g. `/contact` is same in both locales).

## i18n
Add to `messages/fr.json` and `messages/en.json`, top-level key `cookieConsent`:
```json
{
  "cookieConsent": {
    "message": "...",
    "accept": "Accepter",
    "reject": "Refuser",
    "policyLink": "En savoir plus"
  }
}
```
(English translations mirrored under the `en.json` equivalent keys.)

## Out of scope (YAGNI)
- Granular category toggles (analytics/marketing) — no such cookies exist yet; add when analytics is introduced.
- Consent-read admin UI — not requested; records queryable directly via Supabase dashboard if ever needed.
- Re-prompting on choice expiry — no expiry policy requested; can be added later by checking `ts` age in the component.

## Testing
- Manual: fresh browser (no localStorage) shows banner on `/fr` and `/en`; Accept/Reject both hide it and persist across reload; row appears in `cookie_consents` table after each choice; `/confidentialite` renders in both locales.
- No automated test suite exists in this repo for UI components (checked — none found), so no new test scaffolding is introduced; verification is manual per the `verify` skill.
