import Link from 'next/link';
import Icon from './Icon';

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
              <li><Link href="/">Accueil</Link></li>
              <li><Link href="/la-carte">La Carte</Link></li>
              <li><Link href="/notre-histoire">Notre Histoire</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/commander">Mon Panier</Link></li>
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
              <li>
                <span className="f-ico"><Icon name="pin" size={16} /></span>
                <span>Avenue Jacques Vogt, 95340 Persan</span>
              </li>
              <li>
                <span className="f-ico"><Icon name="phone" size={16} /></span>
                <a href="tel:+33751565951">07.51.56.59.51</a>
              </li>
              <li>
                <span className="f-ico"><Icon name="scooter" size={16} /></span>
                <span>Livraison dès 25&nbsp;€ — Persan &amp; alentours</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mega-mark" aria-hidden="true">
        MY CHICKEN
      </div>
      <div className="footer-bottom">
        © <span id="year" suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
        <b>My CHICKEN</b> — Persan · Fait avec{' '}
        <span className="f-ico f-heart"><Icon name="heart" size={13} /></span> et beaucoup de sauce
      </div>
    </footer>
  );
}
