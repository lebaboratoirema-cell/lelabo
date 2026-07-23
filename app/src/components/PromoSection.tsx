import Image from 'next/image';

export default function PromoSection() {
  return (
    <section className="promo">
      <div className="panel dark">
        <Image src="/images/hero-chem-sm.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div className="pc">
          <span className="eyebrow" style={{ color: 'var(--teal-bright)' }}>Devis sur mesure</span>
          <h3>Un prix adapté à chaque commande</h3>
          <p>Vous trouverez ici l&apos;équipement, les produits chimiques et les consommables nécessaires à votre laboratoire.</p>
          <a href="/contact" className="btn">Nous contacter</a>
        </div>
      </div>
      <div className="panel teal">
        <Image src="/images/glassware-sm.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
        <div className="pc">
          <span className="eyebrow" style={{ color: '#fff' }}>Plus de 1700 références</span>
          <h3>Un catalogue complet, en stock ou sur commande</h3>
          <p>Fournisseur d&apos;équipements, produits chimiques, verrerie et consommables de laboratoire.</p>
          <a href="/contact" className="btn btn-ghost">Nous contacter</a>
        </div>
      </div>
    </section>
  );
}
