import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

const products = [
  { ref: 'SOL-2050', name: 'Acétone PA, 2,5 L', desc: 'Acétone de grade analytique haute pureté pour nettoyage et analyse.', tag: 'Solvants', img: '/images/hero-chem.jpg' },
  { ref: 'ACD-1037', name: 'Acide chlorhydrique 37%, 1 L', desc: 'HCl concentré de grade réactif pour titrage et synthèse.', tag: 'Acides', img: '/images/glassware.jpg' },
  { ref: 'RGT-0445', name: 'Hydroxyde de sodium en pastilles, 1 kg', desc: 'NaOH en pastilles de grade réactif, ≥98% de pureté.', tag: 'Réactifs', img: '/images/analysis.jpg' },
  { ref: 'BUF-0700', name: 'Solution tampon pH 7,00, 500 mL', desc: 'Tampon de calibrage coloré, traçable aux standards.', tag: 'Tampons', img: '/images/culture.jpg' },
  { ref: 'SOL-2120', name: 'Éthanol absolu, 2,5 L', desc: "Éthanol absolu dénaturé pour l'extraction et le nettoyage.", tag: 'Solvants', img: '/images/hero-chem.jpg' },
  { ref: 'RGT-0890', name: 'Permanganate de potassium, 500 g', desc: 'Réactif oxydant pour titrage redox et analyse.', tag: 'Réactifs', img: '/images/pipette.jpg' },
];

export default function ChemicalsPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-chem.jpg" alt="" />
        <div className="wrap">
          <h1>Produits chimiques</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Chimie
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="shop-toolbar">
            <span className="count">Affichage de 6 sur 240 produits</span>
            <div className="chips">
              <span className="chip active">Tous</span>
              <span className="chip">Solvants</span>
              <span className="chip">Acides</span>
              <span className="chip">Réactifs</span>
              <span className="chip">Tampons</span>
            </div>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <div className="product-card reveal" key={p.ref}>
                <div className="pimg">
                  <img src={p.img} alt={p.name} />
                  <span className="tag">{p.tag}</span>
                </div>
                <div className="pbody">
                  <div className="ref">Réf. {p.ref}</div>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="pfoot">
                    <span className="price">Sur demande</span>
                    <a href="/fr/contact" className="btn btn-sm">Demander un devis</a>
                  </div>
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
