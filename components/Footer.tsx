export default function Footer() {
  return (
    /* Footer — photo en filigrane */
    <footer className="footer">
      <div className="footer-bg" aria-hidden="true" />
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="f-brand">
              <span className="my">My</span> <span className="ck">Chicken</span>
            </p>
            <p className="f-lead">
              Le vrai goût du poulet mijoté, préparé chaque jour avec du temps, du feu et du cœur.
            </p>
          </div>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><a href="#accueil">Accueil</a></li>
              <li><a href="#carte">La Carte</a></li>
              <li><a href="#histoire">Notre Histoire</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#panier">Mon Panier</a></li>
            </ul>
          </div>
          <div>
            <h4>Horaires</h4>
            <ul>
              <li>Ouvert 7j/7</li>
              <li>11h – 14h</li>
              <li>18h – 22h30</li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li><b>📍</b><span>Avenue Jacques Vogt, 95340 Persan</span></li>
              <li><b>📞</b><a href="tel:+33751565951">07.51.56.59.51</a></li>
              <li><b>🛵</b><span>Livraison dès 25&nbsp;€ — Persan &amp; alentours</span></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mega-mark" aria-hidden="true">
        MY CHICKEN
      </div>
      <div className="footer-bottom">
        © <span id="year" suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
        <b>My CHICKEN</b> — Persan · Fait avec ❤️ et beaucoup de sauce
      </div>
    </footer>
  );
}
