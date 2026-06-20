import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

const products = [
  { ref: 'GLS-2010', name: 'Becher borosilicaté, 250 mL', desc: 'Becher gradué à forme basse, verre Pyrex résistant à la chaleur.', tag: 'Verrerie', img: '/images/glassware.jpg' },
  { ref: 'GLS-2080', name: 'Erlenmeyer, 500 mL', desc: 'Fiole conique à col étroit avec graduations imprimées.', tag: 'Verrerie', img: '/images/hero-chem.jpg' },
  { ref: 'GLS-2150', name: 'Fiole jaugée 100 mL classe A', desc: 'Calibrée avec bouchon PE, certifiée individuellement.', tag: 'Volumétrique', img: '/images/analysis.jpg' },
  { ref: 'CNS-3010', name: 'Lames de microscope, boîte de 50', desc: 'Lames pré-nettoyées à bords coupés, 76×26 mm.', tag: 'Consommables', img: '/images/culture.jpg' },
  { ref: 'CNS-3120', name: 'Gants nitrile, boîte de 100', desc: "Gants d'examen sans poudre, AQL 1,5.", tag: 'Consommables', img: '/images/safety.jpg' },
  { ref: 'GLS-2240', name: 'Pipette graduée, 10 mL', desc: 'Pipette borosilicatée classe AS avec code couleur.', tag: 'Volumétrique', img: '/images/pipette.jpg' },
];

export default function GlasswarePage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/glassware.jpg" alt="" />
        <div className="wrap">
          <h1>Verrerie &amp; consommables</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Verrerie
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="shop-toolbar">
            <span className="count">Affichage de 6 sur 320 produits</span>
            <div className="chips">
              <span className="chip active">Tous</span>
              <span className="chip">Verrerie</span>
              <span className="chip">Volumétrique</span>
              <span className="chip">Consommables</span>
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
