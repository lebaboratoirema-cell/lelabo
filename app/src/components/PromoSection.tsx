import Image from 'next/image';

export default function PromoSection() {
  return (
    <section className="promo">
      <div className="panel dark">
        <Image src="/images/hero-chem-sm.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div className="pc">
          <span className="eyebrow" style={{ color: 'var(--teal-bright)' }}>Meilleur rapport qualité-prix</span>
          <h3>Les meilleurs prix du marché</h3>
          <p>Vous trouverez ici tout ce dont votre laboratoire a besoin — des produits de qualité au meilleur prix.</p>
          <a href="/contact" className="btn">Nous contacter</a>
        </div>
      </div>
      <div className="panel teal">
        <Image src="/images/glassware-sm.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div className="pc">
          <span className="eyebrow" style={{ color: '#fff' }}>Gamme premium</span>
          <h3>Une large sélection de produits premium</h3>
          <p>Fournisseur d&apos;équipements, produits chimiques, verrerie et consommables au meilleur rapport qualité-prix.</p>
          <a href="/contact" className="btn btn-ghost">Nous contacter</a>
        </div>
      </div>
    </section>
  );
}
