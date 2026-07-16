import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

const catalogues = [
  { title: 'Catalogue verrerie 2026', desc: 'Gamme complète de verrerie borosilicatée et volumétrique. · 84 pages', img: '/images/glassware.webp' },
  { title: 'Catalogue consommables', desc: 'Jetables, filtration et fournitures courantes de laboratoire. · 60 pages', img: '/images/analysis.webp' },
  { title: 'Catalogue produits chimiques', desc: 'Solvants, acides, réactifs et solutions tampons. · 120 pages', img: '/images/hero-chem.webp' },
  { title: 'Catalogue équipements', desc: 'Instruments, optique et appareils de mesure. · 96 pages', img: '/images/hero-tech.webp' },
  { title: 'Catalogue milieux de culture', desc: 'Milieux bactériologiques, peptones et extraits. · 42 pages', img: '/images/culture.webp' },
  { title: 'Catalogue hygiène &amp; sécurité', desc: "Équipements de protection et consommables de sécurité. · 38 pages", img: '/images/safety.webp' },
];

export default function CataloguesPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-chem.webp" alt="" />
        <div className="wrap">
          <h1>Catalogues</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Catalogues
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="section-head center reveal">
            <span className="eyebrow">Téléchargements</span>
            <h2>Nos catalogues</h2>
            <p className="lead">
              Téléchargez nos catalogues produits et documentation technique en PDF.
            </p>
          </div>
          <div className="cat-list">
            {catalogues.map((c, i) => (
              <div className="cat-file reveal" key={i}>
                <div className="cover">
                  <img src={c.img} alt={c.title} />
                  <span className="pdf">PDF</span>
                </div>
                <div className="cf">
                  <h3 dangerouslySetInnerHTML={{ __html: c.title }} />
                  <p>{c.desc}</p>
                  <a href="/fr/contact" className="btn btn-sm btn-outline">Télécharger</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
