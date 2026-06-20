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
