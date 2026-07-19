export default function TopBar() {
  return (
    <div className="topbar">
      <div className="wrap">
        <div className="grp left">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
            </svg>
            Lun – Ven : 8h00 – 17h00 · Sam : 8h00 – 13h00
          </span>
        </div>
        <div className="grp right">
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.6a16 16 0 006 6l1.1-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2z"/>
            </svg>
            <a href="tel:+212663123938">+212 6 63 12 39 38</a>
          </span>
          <span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/>
            </svg>
            <a href="mailto:contact@lelaboratoire.ma">contact@lelaboratoire.ma</a>
          </span>
          <span className="socials">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V5h-3c-2.2 0-4 1.8-4 4v2H7v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.94 8.5H3.56V20.5H6.94V8.5Z"/>
                <path d="M5.25 7A2 2 0 105.25 3 2 2 0 005.25 7Z"/>
                <path d="M20.5 20.5v-6.6c0-3.5-1.9-5.2-4.4-5.2a3.8 3.8 0 00-3.4 1.9V8.5H9.3c.05 1 0 12 0 12h3.4v-6.7a2.3 2.3 0 01.1-.8 1.9 1.9 0 011.8-1.3c1.3 0 1.8 1 1.8 2.4v6.4z"/>
              </svg>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
