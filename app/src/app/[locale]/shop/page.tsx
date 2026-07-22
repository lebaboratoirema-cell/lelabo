import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

const categories = [
  { href: '/fr/chemicals', img: '/images/hero-chem.webp', title: 'Produits chimiques', desc: 'Solvants, acides, réactifs et solutions tampons.' },
  { href: '/fr/lab-equipment', img: '/images/hero-tech.webp', title: 'Équipements de laboratoire', desc: 'Instruments, optique, pesage et chauffage.' },
  { href: '/fr/petit-outillage', img: '/images/glassware.webp', title: 'Verrerie', desc: 'Béchers, fioles, pipettes et matériel volumétrique.' },
  { href: '/fr/petit-outillage', img: '/images/safety.webp', title: 'Hygiène &amp; sécurité', desc: 'Gants, masques, lunettes et consommables de protection.' },
  { href: '/fr/chemicals', img: '/images/culture.webp', title: 'Milieux de culture', desc: 'Peptones, agar, extraits et milieux préparés.' },
  { href: '/fr/petit-outillage', img: '/images/analysis.webp', title: 'Consommables', desc: 'Lames, tubes, filtres et fournitures courantes de laboratoire.' },
];

export default function ShopPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-interior.webp" alt="" />
        <div className="wrap">
          <h1>Boutique</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Boutique
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="section-head center reveal">
            <span className="eyebrow">Notre catalogue</span>
            <h2>Parcourir par catégorie</h2>
            <p className="lead">
              Plus de mille références en produits chimiques, équipements, verrerie et
              consommables — issues des meilleures marques mondiales.
            </p>
          </div>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <a className="cat-card reveal" href={c.href} key={i}>
                <img src={c.img} alt={c.title} />
                <div className="cc">
                  <h3 dangerouslySetInnerHTML={{ __html: c.title }} />
                  <p>{c.desc}</p>
                  <span className="go">Voir les produits →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="block bg-soft">
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>Vous ne trouvez pas ce que vous cherchez ?</h2>
              <p>
                Envoyez-nous votre liste et nos conseillers techniques prépareront un devis
                sur mesure.
              </p>
            </div>
            <a href="/fr/contact" className="btn btn-ghost">Demander un devis</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
