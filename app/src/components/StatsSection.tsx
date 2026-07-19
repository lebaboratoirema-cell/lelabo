'use client';

import { useRef, useEffect, useState } from 'react';

const stats = [
  { prefix: '+', to: 10, suffix: '', label: "Années d'expérience" },
  { prefix: '', to: 100, suffix: '%', label: 'Clients satisfaits' },
  { prefix: '+', to: 53, suffix: '', label: 'Produits chimiques' },
  { prefix: '+', to: 12, suffix: '', label: 'Marques mondiales' },
];

export default function StatsSection() {
  const ref = useRef<HTMLElement>(null);
  const [values, setValues] = useState(stats.map(() => 0));
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted) {
          setCounted(true);
          stats.forEach((stat, i) => {
            const step = Math.max(1, Math.round(stat.to / 60));
            let cur = 0;
            const tick = () => {
              cur += step;
              if (cur >= stat.to) {
                setValues(prev => {
                  const next = [...prev];
                  next[i] = stat.to;
                  return next;
                });
              } else {
                setValues(prev => {
                  const next = [...prev];
                  next[i] = cur;
                  return next;
                });
                requestAnimationFrame(tick);
              }
            };
            tick();
          });
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [counted]);

  return (
    <section className="block stats" ref={ref} id="stats">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bgimg" src="/images/dna.webp" alt="" />
      <div className="wrap">
        <div className="stat-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat">
              <b>
                {stat.prefix && <span className="plus">{stat.prefix}</span>}
                {values[i]}
                {stat.suffix}
              </b>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
