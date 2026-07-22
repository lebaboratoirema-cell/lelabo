import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const handleI18n = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Auth guard: check Supabase session for all admin routes except login
  const isAdminRoute = /^\/(fr|en)\/admin/.test(pathname);
  const isLoginPage = /^\/(fr|en)\/admin\/login/.test(pathname);

  if (isAdminRoute && !isLoginPage) {
    let refreshedResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            refreshedResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              refreshedResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // getUser() validates server-side; getSession() only trusts the cookie
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.rewrite(new URL('/403', request.url))
    }

    const i18nResponse = handleI18n(request)
    refreshedResponse.cookies.getAll().forEach((cookie) => i18nResponse.cookies.set(cookie))
    return i18nResponse
  }

  return handleI18n(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
};
