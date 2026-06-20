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
