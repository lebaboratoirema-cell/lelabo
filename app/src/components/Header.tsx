'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header className={`main${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap header-row">
          <Link href="/" className="logo">
            <Image
              className="mark"
              src="/images/logo.jpeg"
              alt="lelaboratoire.ma"
              width={48}
              height={48}
            />
            <span className="word">
              le<b>laboratoire</b>
              <small>.ma</small>
            </span>
          </Link>

          <nav className="primary">
            <ul>
              <li className="active"><Link href="/">Accueil</Link></li>
              <li><Link href="/shop">Boutique</Link></li>
              <li>
                <a href="/glassware">
                  Verrerie{' '}
                  <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </a>
                <ul className="submenu">
                  <li><Link href="/glassware">Verrerie</Link></li>
                  <li><Link href="/glassware">Consommables</Link></li>
                </ul>
              </li>
              <li><Link href="/lab-equipment">Équipements</Link></li>
              <li>
                <a href="/chemicals">
                  Chimie{' '}
                  <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </a>
                <ul className="submenu">
                  <li><Link href="/chemicals">Acides</Link></li>
                  <li><Link href="/chemicals">Réactifs</Link></li>
                  <li><Link href="/chemicals">Solvants</Link></li>
                  <li><Link href="/chemicals">Solutions tampons</Link></li>
                </ul>
              </li>
              <li><Link href="/about">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li>
                <a href="/catalogues">
                  Catalogues{' '}
                  <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </a>
                <ul className="submenu">
                  <li><Link href="/catalogues">Catalogue verrerie</Link></li>
                  <li><Link href="/catalogues">Catalogue consommables</Link></li>
                </ul>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <Link href="/contact" className="quote-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>
                <path d="M2 3h3l2.3 12.4a2 2 0 002 1.6h8.7a2 2 0 002-1.6L22 7H6"/>
              </svg>
              <span className="badge">0</span> Devis
            </Link>
            <button
              className="burger"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-nav${mobileOpen ? ' open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false); }}
      >
        <div className="panel">
          <button className="close" onClick={() => setMobileOpen(false)}>&times;</button>
          <div style={{ clear: 'both', height: 8 }} />
          <Link href="/" onClick={() => setMobileOpen(false)}>Accueil</Link>
          <Link href="/shop" onClick={() => setMobileOpen(false)}>Boutique</Link>
          <Link href="/glassware" onClick={() => setMobileOpen(false)}>Verrerie &amp; Consommables</Link>
          <div className="sub">
            <Link href="/glassware" onClick={() => setMobileOpen(false)}>— Verrerie</Link>
            <Link href="/glassware" onClick={() => setMobileOpen(false)}>— Consommables</Link>
          </div>
          <Link href="/lab-equipment" onClick={() => setMobileOpen(false)}>Équipements de laboratoire</Link>
          <Link href="/chemicals" onClick={() => setMobileOpen(false)}>Chimie</Link>
          <div className="sub">
            <Link href="/chemicals" onClick={() => setMobileOpen(false)}>— Acides</Link>
            <Link href="/chemicals" onClick={() => setMobileOpen(false)}>— Réactifs</Link>
            <Link href="/chemicals" onClick={() => setMobileOpen(false)}>— Solvants</Link>
            <Link href="/chemicals" onClick={() => setMobileOpen(false)}>— Solutions tampons</Link>
          </div>
          <Link href="/about" onClick={() => setMobileOpen(false)}>À propos</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
          <Link href="/catalogues" onClick={() => setMobileOpen(false)}>Catalogues</Link>
        </div>
      </div>
    </>
  );
}
