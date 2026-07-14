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
              <li><Link href="/lab-equipment">Équipement scientifique</Link></li>
              <li><Link href="/chemicals">Produit chimie</Link></li>
              <li>
                <a href="/petit-outillage">
                  Petit outillage{' '}
                  <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </a>
                <ul className="submenu">
                  <li><Link href="/petit-outillage/outillage-verrerie">Verrerie</Link></li>
                  <li><Link href="/petit-outillage/plastique">Plastique</Link></li>
                </ul>
              </li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">À propos</Link></li>
              <li><Link href="/contact">Contact</Link></li>
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
          <Link href="/lab-equipment" onClick={() => setMobileOpen(false)}>Équipement scientifique</Link>
          <Link href="/chemicals" onClick={() => setMobileOpen(false)}>Produit chimie</Link>
          <Link href="/petit-outillage" onClick={() => setMobileOpen(false)}>Petit outillage</Link>
          <div className="sub">
            <Link href="/petit-outillage/outillage-verrerie" onClick={() => setMobileOpen(false)}>— Verrerie</Link>
            <Link href="/petit-outillage/plastique" onClick={() => setMobileOpen(false)}>— Plastique</Link>
          </div>
          <Link href="/blog" onClick={() => setMobileOpen(false)}>Blog</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)}>À propos</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
        </div>
      </div>
    </>
  );
}
