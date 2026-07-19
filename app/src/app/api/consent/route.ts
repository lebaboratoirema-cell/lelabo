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
