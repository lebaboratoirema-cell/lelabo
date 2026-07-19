const clients = [
  { name: 'Univ', accent: 'Rabat' },
  { name: 'Inst', accent: 'Pasteur' },
  { name: 'CHU', accent: 'Casa' },
  { name: 'Fac', accent: 'Sciences' },
  { name: 'Lab', accent: 'Central' },
  { name: 'OCP', accent: 'Group' },
];

export default function ClientsSection() {
  return (
    <section className="block clients" id="clients">
      <div className="wrap">
        <div className="brands-head reveal">
          <span className="eyebrow">Ils nous font confiance</span>
          <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>
            Nos clients
          </h2>
          <p>Universités, hôpitaux, instituts de recherche et industries nous font confiance au quotidien.</p>
        </div>
        <div className="brand-row reveal">
          {clients.map((c, i) => (
            <div key={i} className="brand">
              {c.name}<b>{c.accent}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
