'use client';

import Link from 'next/link';
import Icon from './Icon';
import { useLocationCtx } from '@/lib/location-store';

/* Hero sobre : le logo officiel (fourni par le gérant) pose l'identité,
   une phrase claire, deux boutons, les infos pratiques DU RESTAURANT
   CHOISI (l'adresse suit la sélection Persan / Saint-Mard). */
export default function Hero() {
  const { current, locationId } = useLocationCtx();

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
          <a href={`tel:+33${current.phone.replace(/\D/g, '').slice(1)}`} className="btn btn-ghost">
            {current.phone}
          </a>
        </div>
      </div>
      <div className="hero-info">
        <span>
          <Icon name="pin" size={15} /> {current.address}, <b>{current.city}</b>
        </span>
        <span>
          <Icon name="scooter" size={16} /> Livraison dès <b>{current.minDelivery}&nbsp;€</b>
        </span>
        <span>
          <Icon name="clock" size={15} /> {current.hours}
        </span>
        <span>
          <Icon name="check" size={15} /> <b>Viande halal</b>
        </span>
      </div>
    </div>
  );
}
