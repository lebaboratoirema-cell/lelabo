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
        .admin-nav-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
        .admin-nav-scroll::-webkit-scrollbar { display: none; }
        .admin-page-pad { padding: 32px 32px 80px; }
        .admin-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        @media (max-width: 768px) {
          .admin-header { padding: 0 16px !important; gap: 10px; }
          .admin-brand-text { display: none !important; }
          .admin-nav-scroll nav { gap: 18px !important; }
          .admin-logout-btn { padding: 6px 10px !important; font-size: 12px !important; }
          .admin-page-pad { padding: 20px 16px 60px !important; }
          .admin-2col-grid { grid-template-columns: 1fr !important; }
          .admin-2col-sm { grid-template-columns: 1fr !important; }
          .admin-kpi-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 420px) {
          .admin-kpi-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .admin-form-footer { padding: 12px 16px !important; }
          .admin-form-footer-hint { display: none; }
        }
      `}</style>
      <div className="admin-root" style={{ minHeight: '100vh', background: '#f4f3ef', color: '#1c2230', WebkitFontSmoothing: 'antialiased' }}>
        <header className="admin-header" style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e6e3db' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1c2b46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600, flexShrink: 0 }}>L</div>
            <div className="admin-brand-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'Spectral, serif', fontSize: 16, fontWeight: 600, letterSpacing: '0.2px' }}>Le Laboratoire</span>
              <span style={{ fontSize: 11, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9aa3af' }}>Admin</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
            <div className="admin-nav-scroll" style={{ minWidth: 0 }}>
              <AdminNav />
            </div>
            <form action={signOut} style={{ flexShrink: 0 }}>
              <button
                type="submit"
                className="admin-logout-btn"
                style={{
                  background: 'none',
                  border: '1px solid #e6e3db',
                  borderRadius: 7,
                  padding: '6px 14px',
                  fontSize: 13,
                  color: '#6b6357',
                  cursor: 'pointer',
                  fontFamily: 'Instrument Sans, system-ui, sans-serif',
                  whiteSpace: 'nowrap',
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
