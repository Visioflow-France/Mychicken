import Link from 'next/link';
import Icon from './Icon';

const TICKER_ITEMS = [
  'Poulet mijoté',
  'Sauces maison',
  'Livraison dès 25\u00a0€',
  'Frites maison',
  '3 pilons à 2,50\u00a0€',
  '1 saucisse à 1,50\u00a0€',
  'Menu familial',
];

export default function Hero() {
  return (
    <>
      {/* Hero — fond sombre uni : l'image de fond du site est masquée dans cette 1re section */}
      <div className="hero">
        <div className="hero-veil" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">
            Maison fondée à <b>Persan</b> — Cuisine ouverte 7j/7
          </p>
          <h1 className="hero-title">
            My <em>Chicken</em>
          </h1>
          <div className="hero-rule" aria-hidden="true">
            <i />
          </div>
          <p className="hero-tagline">
            Le vrai goût du poulet mijoté, des frites maison et des sauces préparées chaque jour dans notre cuisine.
          </p>
          <div className="hero-actions">
            <Link href="/la-carte" className="btn btn-solid">Découvrir la carte</Link>
            <a href="tel:+33751565951" className="btn btn-ghost">07.51.56.59.51</a>
          </div>
        </div>
        <div className="hero-info">
          <span>
            <Icon name="pin" size={15} /> Avenue Jacques Vogt, <b>Persan</b>
          </span>
          <span>
            <Icon name="scooter" size={16} /> Livraison dès <b>25&nbsp;€</b>
          </span>
          <span>
            <Icon name="clock" size={15} /> 7j/7 · <b>11h–14h / 18h–22h30</b>
          </span>
        </div>
        {/* Indicateur de scroll vers les best-sellers */}
        <a className="hero-scroll" href="#best-sellers" aria-label="Voir nos best-sellers">
          <Icon name="arrowUp" size={19} strokeWidth={2.2} />
        </a>
      </div>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span className="tick-item">{item}</span>
              <span className="tick-sep" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
