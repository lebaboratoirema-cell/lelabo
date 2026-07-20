export default function ContactStrip() {
  return (
    <div className="contact-strip">
      <div className="wrap">
        <div className="grid">
          <div className="cinfo">
            <span className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.6a16 16 0 006 6l1.1-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2z"/>
              </svg>
            </span>
            <div>
              <h4>Appelez-nous</h4>
              <p>+212 6 63 12 39 38</p>
            </div>
          </div>
          <div className="cinfo">
            <span className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <div>
              <h4>Adresse</h4>
              <p>Lotissement les Oliviers 4, Janat Azaitoune N° 222, Marrakech</p>
            </div>
          </div>
          <div className="cinfo">
            <span className="ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
              </svg>
            </span>
            <div>
              <h4>Horaires d&apos;ouverture</h4>
              <p>Lun – Ven : 8h00 – 17h00<br/>Samedi : 8h00 – 13h00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
