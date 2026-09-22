import Link from 'next/link';

/* Footer — grande carte ambrée aux coins arrondis, panneau « verre »
   à deux colonnes de liens et filigrane géant (relief par ombres). */
export default function Footer() {
  return (
    <footer className="footer">
      <span className="footer-mark" aria-hidden="true">
        MY CHICKEN
      </span>
      <div className="container">
        <div className="footer-card">
          <div className="fc-col">
            <h4>Menu</h4>
            <ul>
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/la-carte">La Carte</Link></li>
              <li><Link href="/notre-histoire">Notre Histoire</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/commander">Commander</Link></li>
            </ul>
          </div>
          <div className="fc-col fc-col-legal">
            <h4>Légales</h4>
            <ul>
              <li><Link href="/mentions-legales">Mentions légales</Link></li>
              <li><Link href="/cgv">Conditions générales de vente</Link></li>
              <li><Link href="/politique-de-confidentialite">Politique de confidentialité</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
          <b>MY CHICKEN</b> — SASU au capital de 1&nbsp;000&nbsp;€ · RCS Meaux 928&nbsp;281&nbsp;278 · TVA FR36928281278
        </p>
        <p className="fb-sub">Avenue Jacques Vogt, 95340 Persan · 07.51.56.59.51 · Ouvert 7j/7</p>
      </div>
    </footer>
  );
}
