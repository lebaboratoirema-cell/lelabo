# Admin Auth Guard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect all `/[locale]/admin/*` routes with Supabase email+password authentication via Next.js edge middleware.

**Architecture:** A Next.js middleware reads the Supabase session cookie on every `/[locale]/admin/*` request. No session rewrites to a `/403` page (URL preserved). A login page at `/[locale]/admin/login` calls a server action that uses `supabase.auth.signInWithPassword`. A logout button in the admin header calls a server action that calls `supabase.auth.signOut`.

**Tech Stack:** Next.js 16.2.9 App Router, `@supabase/ssr` ^0.12.0, TypeScript, React 19 server actions, Tailwind v4.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/src/middleware.ts` | Create | Edge session check — intercepts all admin requests |
| `app/src/app/403/page.tsx` | Create | Static 403 page shown when session missing |
| `app/src/app/[locale]/admin/login/page.tsx` | Create | Login form UI (server component) |
| `app/src/app/[locale]/admin/login/actions.ts` | Create | `signIn` + `signOut` server actions |
| `app/src/app/[locale]/admin/layout.tsx` | Modify | Add logout button to header |
| `app/src/app/[locale]/admin/page.tsx` | Create | Stub dashboard page |

---

## Task 1: Create the edge middleware

**Files:**
- Create: `app/src/middleware.ts`

- [ ] **Step 1: Create `app/src/middleware.ts`**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Let the login page through to avoid redirect loops
  if (request.nextUrl.pathname.endsWith('/admin/login')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: use getUser(), not getSession() — getSession() trusts the cookie
  // without server-side verification. getUser() validates with Supabase servers.
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.rewrite(new URL('/403', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/(fr|en)/admin/:path*'],
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: no TypeScript errors. The middleware will be compiled as an edge function.

- [ ] **Step 3: Commit**

```bash
git add app/src/middleware.ts
git commit -m "feat: add edge middleware — guard all /admin routes behind Supabase session"
```

---

## Task 2: Create the 403 page

**Files:**
- Create: `app/src/app/403/page.tsx`

The 403 page lives outside `[locale]` routing — it's a plain Next.js page at `/403`. The middleware rewrites to this URL internally, so the browser sees the original URL.

- [ ] **Step 1: Create `app/src/app/403/page.tsx`**

```tsx
export default function ForbiddenPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f4f3ef',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: '#1c2230',
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e6e3db',
        borderRadius: 12,
        padding: '48px 56px',
        textAlign: 'center',
        maxWidth: 400,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: '#1c2b46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'Georgia, serif',
          fontSize: 24,
          fontWeight: 600,
          margin: '0 auto 24px',
        }}>L</div>
        <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 8px' }}>
          Accès refusé
        </h1>
        <p style={{ fontSize: 14, color: '#6b6357', margin: '0 0 28px' }}>
          Vous devez être connecté pour accéder à cette page.
        </p>
        <a
          href="/fr/admin/login"
          style={{
            display: 'inline-block',
            background: '#1c2b46',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Se connecter
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: clean build, new route `/403` appears in output.

- [ ] **Step 3: Commit**

```bash
git add app/src/app/403/page.tsx
git commit -m "feat: add 403 page for unauthenticated admin access"
```

---

## Task 3: Create login server actions

**Files:**
- Create: `app/src/app/[locale]/admin/login/actions.ts`

- [ ] **Step 1: Create `app/src/app/[locale]/admin/login/actions.ts`**

```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/fr/admin/login?error=1')
  }

  redirect('/fr/admin')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/fr/admin/login')
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/[locale]/admin/login/actions.ts"
git commit -m "feat: add signIn and signOut server actions"
```

---

## Task 4: Create the login page

**Files:**
- Create: `app/src/app/[locale]/admin/login/page.tsx`

The login page is a server component. It reads `searchParams.error` to show an inline error when credentials are wrong (set by `signIn` action via redirect).

- [ ] **Step 1: Create `app/src/app/[locale]/admin/login/page.tsx`**

```tsx
import { signIn } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Spectral:wght@500;600&display=swap"
        rel="stylesheet"
      />
      <div style={{
        minHeight: '100vh',
        background: '#f4f3ef',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Instrument Sans, system-ui, sans-serif',
        color: '#1c2230',
        WebkitFontSmoothing: 'antialiased',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #e6e3db',
          borderRadius: 12,
          padding: '48px 56px',
          width: '100%',
          maxWidth: 400,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#1c2b46',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: 'Spectral, serif',
              fontSize: 18,
              fontWeight: 600,
            }}>L</div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600 }}>Le Laboratoire</div>
              <div style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9aa3af' }}>Admin</div>
            </div>
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 6px' }}>Connexion</h1>
          <p style={{ fontSize: 14, color: '#6b6357', margin: '0 0 28px' }}>
            Accès réservé aux administrateurs.
          </p>

          {error && (
            <div style={{
              background: '#fdf1ed',
              border: '1px solid #e6c3b8',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#c8643c',
              marginBottom: 20,
            }}>
              Identifiants incorrects. Veuillez réessayer.
            </div>
          )}

          <form action={signIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e6e3db',
                  borderRadius: 8,
                  fontSize: 14,
                  background: '#fafaf8',
                  color: '#1c2230',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e6e3db',
                  borderRadius: 8,
                  fontSize: 14,
                  background: '#fafaf8',
                  color: '#1c2230',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 8,
                background: '#1c2b46',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '11px 0',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: clean build. Route `/[locale]/admin/login` appears in output.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/[locale]/admin/login/page.tsx"
git commit -m "feat: add admin login page"
```

---

## Task 5: Add logout button to admin layout

**Files:**
- Modify: `app/src/app/[locale]/admin/layout.tsx`

Import `signOut` server action and add a `<form>` submit button to the header. The layout is a server component so this is safe.

- [ ] **Step 1: Modify `app/src/app/[locale]/admin/layout.tsx`**

Replace the entire file content:

```tsx
import AdminNav from './_components/AdminNav'
import { signOut } from './login/actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Spectral:wght@500;600&display=swap" rel="stylesheet" />
      <style>{`
        .admin-root { font-family: 'Instrument Sans', system-ui, sans-serif; }
        .admin-input:focus { outline: none; border-color: #1c2b46 !important; box-shadow: 0 0 0 3px rgba(28,43,70,0.08); background: #fff !important; }
        .admin-btn-ghost:hover { background: #f6f4ef; }
        .admin-btn-add:hover { border-color: #c8643c; color: #c8643c; background: #fdf6f2; }
        .admin-add-img:hover { border-color: #c8643c !important; color: #c8643c !important; background: #fdf6f2 !important; }
        .admin-remove-btn:hover { background: #fdf1ed; border-color: #e6c3b8; }
        .admin-select:focus { outline: none; border-color: #1c2b46 !important; box-shadow: 0 0 0 3px rgba(28,43,70,0.08); background: #fff !important; }
      `}</style>
      <div className="admin-root" style={{ minHeight: '100vh', background: '#f4f3ef', color: '#1c2230', WebkitFontSmoothing: 'antialiased' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e6e3db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1c2b46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600 }}>L</div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600, letterSpacing: '0.2px' }}>Le Laboratoire</span>
              <span style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9aa3af' }}>Admin</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <AdminNav />
            <form action={signOut}>
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: '1px solid #e6e3db',
                  borderRadius: 7,
                  padding: '6px 14px',
                  fontSize: 13,
                  color: '#6b6357',
                  cursor: 'pointer',
                  fontFamily: 'Instrument Sans, system-ui, sans-serif',
                }}
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: clean build, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/[locale]/admin/layout.tsx"
git commit -m "feat: add logout button to admin header"
```

---

## Task 6: Create admin dashboard stub

**Files:**
- Create: `app/src/app/[locale]/admin/page.tsx`

- [ ] **Step 1: Create `app/src/app/[locale]/admin/page.tsx`**

```tsx
export default function AdminDashboardPage() {
  return (
    <div style={{
      padding: '48px 40px',
      maxWidth: 900,
      margin: '0 auto',
    }}>
      <h1 style={{
        fontFamily: 'Spectral, serif',
        fontSize: 28,
        fontWeight: 600,
        color: '#1c2230',
        margin: '0 0 8px',
      }}>
        Tableau de bord
      </h1>
      <p style={{ fontSize: 14, color: '#9aa3af', margin: 0 }}>
        Dashboard en cours de développement.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd app && npm run build
```

Expected: clean build. Route `/[locale]/admin` appears in output.

- [ ] **Step 3: Commit**

```bash
git add "app/src/app/[locale]/admin/page.tsx"
git commit -m "feat: add admin dashboard stub"
```

---

## Task 7: End-to-end manual verification

No automated test framework is set up. Verify all flows manually with `npm run dev`.

- [ ] **Step 1: Start dev server**

```bash
cd app && npm run dev
```

- [ ] **Step 2: Verify unauthenticated access blocked**

Navigate to `http://localhost:3000/fr/admin/products`.

Expected: browser URL stays `/fr/admin/products`, page shows "Accès refusé" with "Se connecter" button.

- [ ] **Step 3: Verify login page accessible**

Navigate to `http://localhost:3000/fr/admin/login`.

Expected: login form renders, no 403.

- [ ] **Step 4: Verify wrong credentials show error**

Submit the login form with a bad email/password.

Expected: page reloads, red "Identifiants incorrects" banner appears. No redirect to admin.

- [ ] **Step 5: Verify correct credentials grant access**

Submit login form with a valid Supabase user's email + password (create one in Supabase dashboard → Authentication → Users if needed).

Expected: redirected to `/fr/admin`, dashboard stub renders.

- [ ] **Step 6: Verify protected pages now accessible**

Navigate to `http://localhost:3000/fr/admin/products`.

Expected: products list renders normally.

- [ ] **Step 7: Verify logout clears session**

Click "Déconnexion" button.

Expected: redirected to `/fr/admin/login`. Navigating back to `/fr/admin/products` shows 403 again.

- [ ] **Step 8: Verify login page skips auth check when logged out**

While logged out, navigate to `/fr/admin/login`.

Expected: login form renders (no 403, no loop).

---

## Task 8: Update live/state.md

- [ ] **Step 1: Update `live/state.md`**

In the "Blocking / not yet done" section, change:

```
- No auth guard on `/admin` routes (anyone can access — add before going live)
```

to:

```
- Auth guard implemented — Supabase email+password via edge middleware ✅
```

In "Next session: start here", remove item 1 (auth guard) and move to item 2 (checkout/quote flow).

- [ ] **Step 2: Commit**

```bash
git add live/state.md
git commit -m "docs: mark admin auth guard complete in state.md"
```
