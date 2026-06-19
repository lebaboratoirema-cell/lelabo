export default function AboutSection() {
  return (
    <section className="block" id="about">
      <div className="wrap about-grid">
        <div className="copy reveal">
          <span className="eyebrow">À propos de lelaboratoire.ma</span>
          <h2>Fournisseur de produits chimiques pour laboratoires</h2>
          <p>
            <strong>lelaboratoire.ma</strong> est un fournisseur d&apos;équipements de laboratoire,
            de produits chimiques, de verrerie et de consommables. Nous distribuons des produits chimiques,
            des consommables de laboratoire, de la verrerie, des équipements scientifiques et des instruments
            pour les laboratoires de recherche, de contrôle qualité et d&apos;analyses physico-chimiques.
          </p>
          <p>
            Notre domaine d&apos;expertise couvre tous les secteurs : textile, pharmaceutique, analyse de l&apos;eau,
            agroalimentaire et bien d&apos;autres — réalisant des analyses, tests et mesures de contrôle ainsi
            que des travaux de recherche.
          </p>
          <p>
            En tant que fournisseur d&apos;équipements, de produits chimiques, de verrerie et de consommables,
            nous mettons à disposition de nos clients une équipe de conseillers commerciaux et techniques
            hautement qualifiés pour guider leurs choix et apporter une solution complète.
          </p>
          <a href="/about" className="btn" style={{ marginTop: 8 }}>En savoir plus</a>
        </div>
        <div className="about-media reveal">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="main-img" src="/images/hero-interior.jpg" alt="Équipe en laboratoire" />
          <div className="badge-years"><b>5+</b><span>Ans</span></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="float-img" src="/images/analysis.jpg" alt="Contrôle qualité" />
        </div>
      </div>
    </section>
  );
}
