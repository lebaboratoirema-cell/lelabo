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
