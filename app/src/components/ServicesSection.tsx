const services = [
  {
    href: '/produits-chimiques',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M9 3v6l-5 8a2 2 0 002 3h12a2 2 0 002-3l-5-8V3"/>
        <path d="M7 3h10"/><path d="M8 14h8"/>
      </svg>
    ),
    title: 'Produits chimiques de laboratoire',
    desc: 'Large sélection de solvants organiques, produits chimiques PA et HPLC, acides et produits dangereux.',
  },
  {
    href: '/lab-equipment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 2a3 3 0 013 3v3l4 9a2 2 0 01-2 3H7a2 2 0 01-2-3l4-9V5a3 3 0 013-3z"/>
      </svg>
    ),
    title: 'Équipements d\'enseignement',
    desc: 'Matériel pédagogique et de recherche scientifique pour la physique, la chimie et les sciences de la vie.',
  },
  {
    href: '/lab-equipment',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <path d="M8 4v4M16 4v4M4 12h16"/>
      </svg>
    ),
    title: 'Équipements & instruments de laboratoire',
    desc: 'Équipements de laboratoire, appareils médicaux et biologiques, et instrumentation de mesure.',
  },
  {
    href: '/petit-outillage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>
      </svg>
    ),
    title: 'Consommables hygiène & sécurité',
    desc: 'Consommables de protection et de sécurité — gants, masques, filtres, lunettes de sécurité et plus.',
  },
  {
    href: '/petit-outillage',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M6 2h12M8 2v6l-3 9a2 2 0 002 3h10a2 2 0 002-3l-3-9V2"/>
      </svg>
    ),
    title: 'Verrerie de laboratoire Pyrex',
    desc: 'Consommables et verrerie de laboratoire, pyrex et borosilicate, ainsi qu\'assemblages en verre sur mesure.',
  },
  {
    href: '/produits-chimiques',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="13" r="8"/><path d="M12 13l3-3M9 2h6"/>
      </svg>
    ),
    title: 'Milieux de culture',
    desc: 'Milieux de culture bactériologiques : peptones, extraits de viande et de levure, agar et plus.',
  },
];

export default function ServicesSection() {
  return (
    <section className="block services" id="services">
      <div className="wrap">
        <div className="svc-head reveal">
          <span className="eyebrow">Ce que nous proposons</span>
          <h2 style={{ fontSize: 'clamp(28px,3.4vw,40px)', marginTop: 14 }}>
            Tout ce dont votre laboratoire a besoin
          </h2>
        </div>
        <div className="svc-grid">
          {services.map((svc, i) => (
            <div key={i} className="svc-card reveal">
              <span className="ico">{svc.icon}</span>
              <h3>{svc.title}</h3>
              <p>{svc.desc}</p>
              <a href={svc.href} className="more">En savoir plus →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
