# Admin Auth Guard — Design Spec

**Date:** 2026-06-20  
**Status:** Approved  
**Scope:** Protect all `/[locale]/admin/*` routes with Supabase email+password auth

---

## Problem

All `/admin` routes are currently unprotected. Any user with the URL can read, create, edit, or delete products and categories.

---

## Approach

Next.js middleware at the edge checks Supabase session before every admin request. No session → 403. Valid session → pass through.

Chosen over layout-level guard (B) because middleware is the correct security boundary in Next.js App Router — it runs before any RSC rendering and covers server actions too.

---

## Architecture

```
[Request hits /[locale]/admin/*]
        ↓
[middleware.ts — edge]
  createServerClient (Supabase SSR, reads session cookie)
  supabase.auth.getUser()
  → no session  → rewrite to 403 page (URL preserved)
  → session OK  → NextResponse.next()
        ↓
[admin/layout.tsx — adds logout button to header]
        ↓
[admin pages — unchanged]
```

**Login flow:**
```
[/[locale]/admin/login]
  email + password form
  → server action: supabase.auth.signInWithPassword()
  → fail  → inline error "Identifiants incorrects"
  → success → redirect('/fr/admin')
```

**Logout flow:**
```
[logout button in admin header]
  → server action: supabase.auth.signOut()
  → redirect('/fr/admin/login')
```

---

## Files

| File | Action |
|---|---|
| `app/src/middleware.ts` | Create — edge session check |
| `app/src/app/[locale]/admin/login/page.tsx` | Create — login form UI |
| `app/src/app/[locale]/admin/login/actions.ts` | Create — signIn + signOut server actions |
| `app/src/app/[locale]/admin/layout.tsx` | Modify — add logout button to header |
| `app/src/app/[locale]/admin/page.tsx` | Create — stub dashboard ("coming soon") |

---

## Middleware detail

- Matcher: `/:locale/admin/:path*` (covers fr + en)
- Login route excluded from check to prevent redirect loop
- Uses `@supabase/ssr` `createServerClient` with cookie adapter (same pattern as existing `src/lib/supabase/server.ts`)
- Returns `NextResponse.rewrite(new URL('/403', request.url))` on no session — URL stays unchanged in browser

---

## Login page

- Route: `/fr/admin/login` (hardcoded locale, acceptable for French-only MVP)
- Fields: email, password
- No "forgot password" link (can be added later via Supabase reset email)
- No signup link (signup intentionally disabled — admins created manually in Supabase dashboard)
- Styling: matches existing admin design system (Instrument Sans, warm palette, `#1c2b46` dark navy)

---

## 403 page

- Route: `/403` (static, outside locale routing)
- Content: "Accès refusé" + link to `/fr/admin/login`
- URL preserved in browser (rewrite, not redirect)

---

## User management

- No in-app user management UI
- Admins created/deleted in Supabase dashboard → Authentication → Users
- All authenticated Supabase users = admin access
- No `profiles.role` column yet — required when customer auth is added (separate feature)

---

## Dashboard stub

- Route: `/fr/admin` (new)
- Content: placeholder "Dashboard — coming soon"
- Will be replaced when design is provided

---

## Out of scope

- Forgot password / email reset flow
- Role-based access control (admin vs customer)
- Session refresh / sliding expiry (Supabase handles this automatically)
- Rate limiting on login attempts (Supabase has built-in protection)
