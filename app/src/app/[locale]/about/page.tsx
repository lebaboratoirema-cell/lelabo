import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import StatsSection from '@/components/StatsSection';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';

export default function AboutPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-interior.jpg" alt="" />
        <div className="wrap">
          <h1>À propos de nous</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            À propos
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap about-grid">
          <div className="copy reveal">
            <span className="eyebrow">Qui sommes-nous</span>
            <h2>Fournisseur de produits chimiques pour laboratoires</h2>
            <p>
              <strong>lelaboratoire.ma</strong> est un fournisseur d&apos;équipements de
              laboratoire, de produits chimiques, de verrerie et de consommables. Nous
              distribuons aux laboratoires de recherche, de contrôle qualité et
              d&apos;analyse physico-chimique dans tous les secteurs d&apos;activité.
            </p>
            <p>
              Notre domaine d&apos;expertise couvre le textile, le pharmaceutique, l&apos;analyse
              de l&apos;eau, l&apos;agro-alimentaire et bien plus — en soutien à l&apos;analyse,
              aux essais, aux mesures de contrôle et à la recherche.
            </p>
            <p>
              En tant que fournisseur d&apos;équipements, de produits chimiques, de verrerie et
              de consommables, nous mettons à la disposition de nos clients une équipe de
              conseillers commerciaux et techniques hautement qualifiés pour guider leurs
              choix techniques et apporter une solution complète.
            </p>
            <a href="/fr/contact" className="btn" style={{ marginTop: '8px' }}>
              Nous contacter
            </a>
          </div>
          <div className="about-media reveal">
            <img className="main-img" src="/images/hero-interior.jpg" alt="Équipe en laboratoire" />
            <div className="badge-years">
              <b>5+</b>
              <span>Ans</span>
            </div>
            <img className="float-img" src="/images/analysis.jpg" alt="Contrôle qualité" />
          </div>
        </div>
      </section>

      <section className="block bg-soft">
        <div className="wrap">
          <div className="section-head center reveal">
            <span className="eyebrow">Pourquoi nous choisir</span>
            <h2>Ce qui nous distingue</h2>
          </div>
          <div className="value-grid">
            <div className="value-card reveal">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </span>
              <h3>Qualité certifiée</h3>
              <p>
                Produits issus de marques reconnues, répondant aux standards de qualité et
                de traçabilité.
              </p>
            </div>
            <div className="value-card reveal">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <rect x="1" y="6" width="14" height="11" rx="1" />
                  <path d="M15 9h4l3 3v5h-7" />
                  <circle cx="6" cy="18" r="2" />
                  <circle cx="18" cy="18" r="2" />
                </svg>
              </span>
              <h3>Approvisionnement fiable</h3>
              <p>
                Livraison rapide et fiable, stock géré pour que votre laboratoire ne
                manque jamais de rien.
              </p>
            </div>
            <div className="value-card reveal">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 20a6 6 0 0112 0" />
                  <path d="M16 5a3 3 0 010 6M21 20a6 6 0 00-4-5.6" />
                </svg>
              </span>
              <h3>Conseil expert</h3>
              <p>
                Conseillers commerciaux et techniques qualifiés pour orienter chaque
                choix technique.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
      <SiteFooter />
    </>
  );
}
