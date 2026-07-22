'use client';

import { useState, useEffect, useCallback } from 'react';

const slides = [
  {
    bg: '/images/hero-interior-sm.webp',
    eyebrow: 'Bienvenue chez lelaboratoire.ma',
    title: 'Votre fournisseur d\'équipements de laboratoire & produits chimiques.',
    desc: 'La référence en instruments de laboratoire, produits chimiques, verrerie et consommables — au service des équipes de recherche et de contrôle qualité.',
    cta1: { label: 'Voir le catalogue', href: '/shop' },
    cta2: { label: 'Nous contacter', href: '/contact' },
    thumbs: ['/images/glassware.webp', '/images/analysis.webp', '/images/hero-tech.webp'],
  },
  {
    bg: '/images/hero-chem-sm.webp',
    eyebrow: 'Fournisseur de produits chimiques',
    title: 'Une large gamme de produits chimiques de haute pureté.',
    desc: 'Solvants, réactifs et acides d\'excellente pureté chimique et nombreuses spécifications, développés en continu pour répondre aux exigences de qualité et de performance.',
    cta1: { label: 'Explorer la chimie', href: '/produits-chimiques' },
    cta2: { label: 'Demander un devis', href: '/contact' },
    thumbs: ['/images/glassware.webp', '/images/pipette.webp', '/images/culture.webp'],
  },
  {
    bg: '/images/hero-tech.webp',
    eyebrow: 'Équipements & instruments',
    title: 'Équipements de laboratoire pour toutes les disciplines.',
    desc: 'Une large sélection d\'équipements de laboratoire pédagogique, de recherche, industriel et pharmaceutique — instruments de mesure et d\'analyse pour chaque besoin.',
    cta1: { label: 'Voir les équipements', href: '/lab-equipment' },
    cta2: { label: 'Nous contacter', href: '/contact' },
    thumbs: ['/images/analysis.webp', '/images/culture.webp', '/images/safety.webp'],
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);

  const go = useCallback((n: number) => {
    setIdx((n + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => go(idx + 1), 6000);
    return () => clearInterval(timer);
  }, [idx, go]);

  return (
    <section className="hero" id="hero">
      <button className="hero-arrow prev" onClick={() => go(idx - 1)} aria-label="Précédent">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button className="hero-arrow next" onClick={() => go(idx + 1)} aria-label="Suivant">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {slides.map((slide, i) => (
        <div key={i} className={`slide${i === idx ? ' active' : ''}`}>
          <div className="slide-bg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.bg} alt="" />
          </div>
          <div className="wrap inner">
            <div className="hero-content">
              <span className="eyebrow">{slide.eyebrow}</span>
              <h1>{slide.title}</h1>
              <p>{slide.desc}</p>
              <div className="cta-row">
                <a href={slide.cta1.href} className="btn">{slide.cta1.label}</a>
                <a href={slide.cta2.href} className="btn btn-ghost">{slide.cta2.label}</a>
              </div>
            </div>
          </div>
          <div className="thumbs">
            {slide.thumbs.map((t, ti) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={ti} src={t} alt="" />
            ))}
          </div>
        </div>
      ))}

      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={i === idx ? 'active' : ''}
            onClick={() => go(i)}
            aria-label={`Diapositive ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
