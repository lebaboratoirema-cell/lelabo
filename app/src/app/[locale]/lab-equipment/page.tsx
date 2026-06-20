import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

const products = [
  { ref: 'EQP-1100', name: 'Microscope binoculaire de laboratoire', desc: "Éclairage LED, grossissement 40×–1000×, objectifs achromatiques.", tag: 'Optique', img: '/images/hero-tech.jpg' },
  { ref: 'EQP-1210', name: 'Centrifugeuse de paillasse, 6×50 mL', desc: "Contrôle numérique de vitesse jusqu'à 4000 tr/min avec verrouillage du couvercle.", tag: 'Séparation', img: '/images/analysis.jpg' },
  { ref: 'EQP-1320', name: 'Balance analytique, 0,1 mg', desc: "Capacité 220 g, calibration interne, pare-brise.", tag: 'Pesage', img: '/images/pipette.jpg' },
  { ref: 'EQP-1450', name: 'Agitateur chauffant magnétique', desc: "Plateau céramique, jusqu'à 340 °C et 1500 tr/min.", tag: 'Chauffage', img: '/images/glassware.jpg' },
  { ref: 'EQP-1560', name: 'pH-mètre de paillasse', desc: "Haute précision avec compensation automatique de température.", tag: 'Mesure', img: '/images/culture.jpg' },
  { ref: 'EQP-1675', name: 'Étuve à convection forcée', desc: "Chambre 53 L, de +5 °C jusqu'à 250 °C, minuterie numérique.", tag: 'Séchage', img: '/images/hero-interior.jpg' },
];

export default function LabEquipmentPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-tech.jpg" alt="" />
        <div className="wrap">
          <h1>Équipements de laboratoire</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Équipements
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="shop-toolbar">
            <span className="count">Affichage de 6 sur 180 produits</span>
            <div className="chips">
              <span className="chip active">Tous</span>
              <span className="chip">Optique</span>
              <span className="chip">Pesage</span>
              <span className="chip">Chauffage</span>
              <span className="chip">Mesure</span>
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
