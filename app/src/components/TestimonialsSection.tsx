const testimonials = [
  {
    quote: "Réactivité impeccable et produits toujours conformes aux normes. Notre laboratoire travaille avec eux depuis 3 ans sans le moindre souci.",
    name: 'Dr. Amina Benjelloun',
    role: 'Responsable laboratoire, CHU Rabat',
  },
  {
    quote: "Large catalogue, livraison rapide et équipe technique disponible pour conseiller sur le bon matériel. Un partenaire fiable pour nos achats scientifiques.",
    name: 'Youssef El Fassi',
    role: "Chef de département, Faculté des Sciences",
  },
  {
    quote: "Le suivi des commandes et la qualité de la verrerie reçue dépassent nos attentes. Nous recommandons sans hésiter.",
    name: 'Sara Idrissi',
    role: 'Ingénieure qualité, Institut Pasteur du Maroc',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="block testimonials" id="testimonials">
      <div className="wrap">
        <div className="brands-head reveal">
          <span className="eyebrow">Témoignages</span>
          <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>
            Ce que disent nos clients
          </h2>
        </div>
        <div className="testi-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card reveal">
              <svg className="quote-ico" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.5 6C6 6 3.5 8.7 3.5 12.3c0 3.1 2 5.3 4.6 5.3.4 3-1.4 4.6-3.4 5.3l.8 1.6c3.6-1.1 6.3-3.7 6.3-8.4C11.8 12 10.3 6 9.5 6zm10 0c-3.5 0-6 2.7-6 6.3 0 3.1 2 5.3 4.6 5.3.4 3-1.4 4.6-3.4 5.3l.8 1.6c3.6-1.1 6.3-3.7 6.3-8.4C21.8 12 20.3 6 19.5 6z"/>
              </svg>
              <p>{t.quote}</p>
              <div className="testi-who">
                <b>{t.name}</b>
                <span>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
