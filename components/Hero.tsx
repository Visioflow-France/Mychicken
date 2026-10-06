import Link from 'next/link';
import Icon from './Icon';

/* Hero sobre : le logo officiel (découpé du flyer) pose l'identité,
   une phrase claire, deux boutons, les infos pratiques. Pas d'artifice. */
export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-veil" aria-hidden="true" />
      <div className="hero-content">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="hero-logo" src="/logo.png" alt="My Chicken — poulet braisé" width={220} height={220} />
        <p className="hero-kicker">Poulet braisé · Sauces maison · 7j/7</p>
        <p className="hero-tagline">
          Le vrai goût du poulet braisé, des frites maison et des sauces
          préparées chaque jour dans notre cuisine.
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
          <Icon name="clock" size={15} /> 7j/7 · <b>11h30–21h30</b>
        </span>
        <span>
          <Icon name="check" size={15} /> <b>Viande halal</b>
        </span>
      </div>
    </div>
  );
}
