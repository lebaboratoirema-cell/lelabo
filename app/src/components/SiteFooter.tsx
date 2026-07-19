"use client";

export default function SiteFooter() {
  return (
    <footer className="site" id="contact">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <a href="/" className="logo" style={{ marginBottom: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.jpeg" alt="logo" style={{ width: 54, height: 54, borderRadius: '50%', background: '#fff' }} />
              <span className="word" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                le<b style={{ color: 'var(--teal-bright)' }}>laboratoire</b>
                <small style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#7c919a' }}>.ma</small>
              </span>
            </a>
            <p>
              lelaboratoire.ma est votre fournisseur de référence en matériaux et équipements de laboratoire
              — produits chimiques, verrerie et consommables pour tous les secteurs d&apos;activité.
            </p>
          </div>

          <div>
            <h4>Contact</h4>
            <ul className="foot-contact">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                63, Avenue de la Liberté, Ville 2000
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.6a16 16 0 006 6l1.1-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2z"/>
                </svg>
                +212 6 63 12 39 38
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/>
                </svg>
                contact@lelaboratoire.ma
              </li>
            </ul>
          </div>

          <div>
            <h4>Secteurs d&apos;activité</h4>
            <ul className="foot-tags">
              <li>Agroalimentaire</li>
              <li>Biologie</li>
              <li>Sciences de la vie</li>
              <li>Pharmaceutique</li>
              <li>Enseignement</li>
              <li>Chimie</li>
              <li>Cosmétique</li>
              <li>Automobile</li>
              <li>Textile</li>
            </ul>
          </div>

          <div>
            <h4>Nous écrire</h4>
            <form className="foot-form" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Votre nom" />
              <input type="email" placeholder="Votre email" />
              <textarea placeholder="Votre message" />
              <button className="btn" type="submit">Envoyer le message</button>
            </form>
          </div>
        </div>

        <div className="foot-bottom">
          <span>© 2026 lelaboratoire.ma. Tous droits réservés.</span>
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
          </span>
        </div>
      </div>
    </footer>
  );
}
