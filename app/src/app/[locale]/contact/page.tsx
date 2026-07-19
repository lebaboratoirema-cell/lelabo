import TopBar from '@/components/TopBar';
import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import ScrollReveal from '@/components/ScrollReveal';
import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <>
      <ScrollReveal />
      <TopBar />
      <Header />

      <section className="page-banner">
        <img className="bgimg" src="/images/hero-tech.webp" alt="" />
        <div className="wrap">
          <h1>Contactez-nous</h1>
          <div className="breadcrumb">
            <a href="/fr">Accueil</a>
            <span className="sep">/</span>
            Contact
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-info reveal">
              <span className="eyebrow">Prenez contact</span>
              <h2 style={{ margin: '12px 0 26px', fontSize: '32px' }}>
                Nous serions ravis de vous entendre
              </h2>
              <div className="ci-item">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.6a16 16 0 006 6l1.1-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2z" />
                  </svg>
                </span>
                <div>
                  <h4>Téléphone</h4>
                  <p>+212 6 63 12 39 38</p>
                </div>
              </div>
              <div className="ci-item">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16v16H4z" />
                    <path d="M22 6l-10 7L2 6" />
                  </svg>
                </span>
                <div>
                  <h4>Email</h4>
                  <p>contact@lelaboratoire.ma</p>
                </div>
              </div>
              <div className="ci-item">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div>
                  <h4>Adresse</h4>
                  <p>63, Avenue de la Liberté<br />Imm. Palace, Bureau A3-5, Ville 2000</p>
                </div>
              </div>
              <div className="ci-item">
                <span className="ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </span>
                <div>
                  <h4>Horaires d&apos;ouverture</h4>
                  <p>Lun – Ven : 8h00 – 17h00<br />Samedi : 8h00 – 13h00</p>
                </div>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '90px' }}>
        <div className="wrap">
          <div className="map reveal">
            <iframe
              loading="lazy"
              src="https://www.google.com/maps?q=Casablanca+Morocco&output=embed"
              title="Carte"
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
