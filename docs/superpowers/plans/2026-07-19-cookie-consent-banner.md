# Cookie Consent Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bottom-bar cookie consent banner (accept/reject) that logs proof of consent to Supabase, plus a minimal privacy policy page, satisfying CNDP (Morocco) and GDPR (EU).

**Architecture:** Client component checks `localStorage` on mount and renders a fixed bottom bar if no choice is recorded yet. On click it writes `localStorage` immediately (instant UI) and fire-and-forgets a POST to a new `/api/consent` route, which hashes the visitor's IP and inserts a row into a new `cookie_consents` Supabase table. A new `/confidentialite` page (fr/en branch, no next-intl messages — matches this codebase's existing pattern of hardcoded bilingual branches rather than `messages/*.json`, since no component currently uses `useTranslations`) documents what's collected.

**Tech Stack:** Next.js 16 App Router, next-intl (`useLocale` only, not `useTranslations` — matches codebase convention), Supabase (`@supabase/ssr`), plain CSS in `globals.css`.

**Deviation from spec:** The spec's "i18n" section proposed adding keys to `messages/fr.json`/`messages/en.json`. Investigation during planning found `useTranslations`/messages are unused anywhere in this codebase — every page/component hardcodes French text, with no locale branching (e.g. `contact/page.tsx` renders identical French content under both `/fr` and `/en`). To stay consistent with the existing codebase rather than introduce a first-of-its-kind pattern, this plan hardcodes an inline `{ fr, en }` text object in the banner component and a fr/en branch in the privacy page instead, using `useLocale()` (already available via `NextIntlClientProvider`) to pick which one to show. Functionally equivalent, matches how the rest of the site is actually built.

---

### Task 1: Database migration

**Files:**
- Create: `supabase/migrations/006_cookie_consents.sql`

- [ ] **Step 1: Write the migration**

```sql
create table cookie_consents (
  id          uuid        primary key default gen_random_uuid(),
  choice      text        not null check (choice in ('accepted','rejected')),
  locale      text        not null,
  ip_hash     text        not null,
  user_agent  text,
  created_at  timestamptz not null default now()
);

alter table cookie_consents enable row level security;

create policy "anon can insert own consent"
  on cookie_consents for insert
  to anon
  with check (true);
```

- [ ] **Step 2: Confirm no local Supabase CLI apply step exists in this repo**

Run: `ls ../supabase 2>/dev/null || ls supabase` (from `app/`) — confirm `migrations/` is the only convention (no `supabase/config.toml` requiring `supabase db push`). If a Supabase CLI workflow is configured, apply the migration per that workflow; otherwise this file is applied manually via the Supabase dashboard SQL editor by the project owner — note this in the commit message, do not attempt to run it yourself against a live project.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/006_cookie_consents.sql
git commit -m "feat: add cookie_consents table for consent audit trail"
```

---

### Task 2: Env var for IP hashing pepper

**Files:**
- Modify: `app/.env.example`

- [ ] **Step 1: Append the new var**

Add to the end of `app/.env.example`:

```
# Cookie consent — server-side pepper for hashing visitor IPs before storage (never store raw IP)
CONSENT_IP_PEPPER=generate-a-random-32-char-string
```

- [ ] **Step 2: Commit**

```bash
git add app/.env.example
git commit -m "chore: add CONSENT_IP_PEPPER to env example"
```

Note: this does not touch the real `.env` file — the project owner must add a real random value there themselves.

---

### Task 3: Consent logging API route

**Files:**
- Create: `app/src/app/api/consent/route.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const choice = body?.choice
  const locale = typeof body?.locale === 'string' ? body.locale : 'fr'

  if (choice !== 'accepted' && choice !== 'rejected') {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const pepper = process.env.CONSENT_IP_PEPPER ?? ''
  const ipHash = createHash('sha256').update(ip + pepper).digest('hex')
  const userAgent = request.headers.get('user-agent')

  const supabase = await createClient()
  const { error } = await supabase.from('cookie_consents').insert({
    choice,
    locale,
    ip_hash: ipHash,
    user_agent: userAgent,
  })

  if (error) return NextResponse.json({ ok: false }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Type-check**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors referencing `src/app/api/consent/route.ts`

- [ ] **Step 3: Commit**

```bash
git add app/src/app/api/consent/route.ts
git commit -m "feat: add /api/consent route to log cookie consent"
```

---

### Task 4: Cookie consent banner component

**Files:**
- Create: `app/src/components/CookieConsentBanner.tsx`
- Modify: `app/src/app/globals.css` (append banner styles)

- [ ] **Step 1: Write the component**

```tsx
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
          <button type="button" className="btn btn-outline btn-sm" onClick={() => choose('rejected')}>
            {t.reject}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Append banner styles to globals.css**

Add to the end of `app/src/app/globals.css`:

```css
/* Cookie consent banner */
.cookie-banner {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 999;
  background: var(--navy); color: #cdd9de;
  box-shadow: 0 -8px 24px -14px rgba(11,44,61,.4);
}
.cookie-banner-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 18px 28px; flex-wrap: wrap;
}
.cookie-banner-inner p { margin: 0; font-size: 13px; line-height: 1.6; max-width: 760px; }
.cookie-banner-inner a { color: var(--teal-bright); text-decoration: underline; text-underline-offset: 2px; }
.cookie-banner-actions { display: flex; gap: 12px; flex: none; }
```

- [ ] **Step 3: Type-check**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors referencing `CookieConsentBanner.tsx`

- [ ] **Step 4: Commit**

```bash
git add app/src/components/CookieConsentBanner.tsx app/src/app/globals.css
git commit -m "feat: add CookieConsentBanner component"
```

---

### Task 5: Mount banner in locale layout

**Files:**
- Modify: `app/src/app/[locale]/layout.tsx`

- [ ] **Step 1: Add the import and mount inside the provider**

Change:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
```
to:
```tsx
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import CookieConsentBanner from '@/components/CookieConsentBanner';
import '../globals.css';
```

Change:
```tsx
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
```
to:
```tsx
      <body>
        <NextIntlClientProvider>
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
      </body>
```

(Banner stays inside `NextIntlClientProvider` because it uses `useLocale()`.)

- [ ] **Step 2: Type-check**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/app/[locale]/layout.tsx
git commit -m "feat: mount CookieConsentBanner in locale layout"
```

---

### Task 6: Privacy policy page

**Files:**
- Create: `app/src/app/[locale]/confidentialite/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  return (
    <>
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-tech.webp" alt="" />
        <div className="wrap">
          <h1>{isEn ? 'Privacy Policy' : 'Politique de confidentialité'}</h1>
          <div className="breadcrumb">
            <a href={`/${locale}`}>{isEn ? 'Home' : 'Accueil'}</a>
            <span className="sep">/</span>
            {isEn ? 'Privacy Policy' : 'Confidentialité'}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap blog-content" style={{ maxWidth: 820, margin: '0 auto' }}>
          {isEn ? (
            <>
              <h2>Cookies we use</h2>
              <p>
                lelaboratoire.ma currently uses only cookies necessary for the site to function
                (session and shopping cart). We do not currently use analytics or marketing
                cookies.
              </p>
              <h2>What we record when you choose</h2>
              <p>
                When you accept or reject cookies, we record your choice, the date and time,
                your language, and a one-way hashed version of your IP address — never the raw
                address — as proof of consent in case of an audit under Moroccan Law 09-08
                (CNDP) or the EU GDPR. This record is kept indefinitely as compliance evidence
                and is not used to build a profile of you.
              </p>
              <h2>Your rights</h2>
              <p>
                You can access, correct, or request deletion of your data at any time by writing
                to <a href="mailto:contact@lelaboratoire.ma">contact@lelaboratoire.ma</a>.
              </p>
            </>
          ) : (
            <>
              <h2>Cookies utilisés</h2>
              <p>
                lelaboratoire.ma utilise aujourd&apos;hui uniquement des cookies nécessaires au
                fonctionnement du site (session et panier). Aucun cookie analytique ou
                publicitaire n&apos;est utilisé pour le moment.
              </p>
              <h2>Ce que nous enregistrons lors de votre choix</h2>
              <p>
                Lorsque vous acceptez ou refusez les cookies, nous enregistrons votre choix, la
                date et l&apos;heure, votre langue, ainsi qu&apos;une version hachée (non
                réversible) de votre adresse IP — jamais l&apos;adresse brute — comme preuve de
                consentement en cas de contrôle au titre de la loi marocaine 09-08 (CNDP) ou du
                RGPD européen. Cet enregistrement est conservé indéfiniment comme preuve de
                conformité et ne sert pas à établir un profil vous concernant.
              </p>
              <h2>Vos droits</h2>
              <p>
                Vous pouvez accéder à vos données, les corriger ou demander leur suppression à
                tout moment en écrivant à{' '}
                <a href="mailto:contact@lelaboratoire.ma">contact@lelaboratoire.ma</a>.
              </p>
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run (from `app/`): `npx tsc --noEmit`
Expected: no new errors

- [ ] **Step 3: Commit**

```bash
git add app/src/app/[locale]/confidentialite/page.tsx
git commit -m "feat: add /confidentialite privacy policy page"
```

---

### Task 7: Manual end-to-end verification

No automated test suite exists in this repo for UI/routes (confirmed during brainstorming — none found). Verify manually per the `verify` skill.

- [ ] **Step 1: Build**

Run (from `app/`): `npm run build`
Expected: builds without errors

- [ ] **Step 2: Run dev server and check banner on first visit**

Run: `npm run dev`, open `http://localhost:3000/fr` in a browser with no site data (or clear localStorage/devtools Application tab first).
Expected: bottom bar banner visible with French text, "Accepter" / "Refuser" buttons, link to `/fr/confidentialite`.

- [ ] **Step 3: Check English locale**

Open `http://localhost:3000/en` (fresh localStorage).
Expected: banner shows English text, link points to `/en/confidentialite`.

- [ ] **Step 4: Check accept/reject persistence**

Click "Accepter". Banner disappears. Reload page.
Expected: banner does not reappear (localStorage `cookie_consent` key set).
Open devtools Application tab → clear localStorage → reload → click "Refuser" instead.
Expected: same persistence behavior for reject.

- [ ] **Step 5: Confirm consent row logged**

After Step 4, check the Supabase project's `cookie_consents` table (dashboard → Table Editor) for the project owner.
Expected: one row per click, with `choice`, `locale`, `ip_hash` (not a raw IP), and `created_at` populated. (Requires `CONSENT_IP_PEPPER` and Supabase env vars to be set in `.env` — flag to the user if rows are missing due to a local env misconfiguration, don't debug their Supabase project for them.)

- [ ] **Step 6: Check privacy page renders in both locales**

Visit `/fr/confidentialite` and `/en/confidentialite` directly.
Expected: correct language content in each, no console errors.

- [ ] **Step 7: Lint**

Run (from `app/`): `npm run lint`
Expected: no new errors from the files touched in this plan.
