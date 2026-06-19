const brands = [
  { name: 'Chem', accent: 'Lab' },
  { name: 'Pure', accent: 'Sci' },
  { name: 'Bio', accent: 'Nova' },
  { name: 'Lab', accent: 'Tech' },
  { name: 'Vitra', accent: 'Glass' },
  { name: 'Omni', accent: 'Reag' },
];

export default function BrandsSection() {
  return (
    <section className="block" id="brands">
      <div className="wrap">
        <div className="brands-head reveal">
          <span className="eyebrow">Partenaires de confiance</span>
          <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>
            Produits des meilleures marques mondiales
          </h2>
          <p>Nous proposons des articles des marques européennes et asiatiques les plus reconnues pour satisfaire nos clients.</p>
        </div>
        <div className="brand-row reveal">
          {brands.map((b, i) => (
            <div key={i} className="brand">
              {b.name}<b>{b.accent}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
