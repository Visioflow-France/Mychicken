'use client';

import Reveal from './Reveal';
import Icon, { type IconName } from './Icon';
import { useLocationCtx } from '@/lib/location-store';

export default function Contact() {
  const { current, locations } = useLocationCtx();

  const telHref = `tel:+33${current.phone.replace(/\D/g, '').slice(1)}`;
  const INFOS: { title: string; icon: IconName; alt: string; content: React.ReactNode }[] = [
    {
      title: 'Adresse',
      icon: 'pin',
      alt: 'Adresse du restaurant',
      content: <>{current.address}<br />{current.postal} {current.city}</>,
    },
    {
      title: 'Téléphone',
      icon: 'phone',
      alt: 'Téléphone',
      content: <a href={telHref}>{current.phone}</a>,
    },
    {
      title: 'Horaires',
      icon: 'clock',
      alt: 'Horaires d\'ouverture',
      content: <>{current.hours}</>,
    },
    {
      title: 'Livraison',
      icon: 'scooter',
      alt: 'Livraison à domicile',
      content: <>{current.city} &amp; communes alentour ({current.deliveryZones.slice(0, 4).join(', ')}…), dès {current.minDelivery}&nbsp;€ d&apos;achat.</>,
    },
  ];

  return (
    <>
      <div className="section after-nav">
        <div className="container">
        <div className="contact-grid">
          <Reveal className="panel">
            <h3>Nous trouver</h3>
            {INFOS.map((info) => (
              <div className="c-line" key={info.title}>
                <span className="c-ico">
                  <Icon name={info.icon} size={22} />
                </span>
                <div>
                  <h4>{info.title}</h4>
                  <p>{info.content}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal className="map-frame">
          <iframe
            title={`My CHICKEN sur la carte — ${current.address}, ${current.city}`}
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(`${current.address}, ${current.postal} ${current.city}`)}&output=embed`}
          />
        </Reveal>

        {/* Les deux adresses, avec itinéraire */}
        <div className="contact-locations">
          {locations.map((l) => (
            <a
              key={l.id}
              className={`cl-card${l.id === current.id ? ' active' : ''}`}
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${l.address}, ${l.postal} ${l.city}`)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Icon name="pin" size={16} />
              <span>
                <b>My Chicken {l.city}</b>
                <p>{l.address}, {l.postal} {l.city}</p>
                <p>{l.phone} · {l.hours}</p>
                <p className="cl-halal"><Icon name="check" size={13} strokeWidth={2.4} /> Viande halal</p>
              </span>
            </a>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}
