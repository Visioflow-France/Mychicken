'use client';

import { useRef } from 'react';
import Reveal from './Reveal';
import Icon, { type IconName } from './Icon';
import { useToast } from '@/lib/toast';
import { useLocationCtx } from '@/lib/location-store';

export default function Contact() {
  const toast = useToast();
  const { current, locations } = useLocationCtx();
  const formRef = useRef<HTMLFormElement>(null);

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Message envoyé ! Nous vous répondons très vite.');
    formRef.current?.reset();
  };

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

          <Reveal className="panel">
            <h3>Écrivez-nous</h3>
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="form-row">
                <div className="f-group">
                  <label htmlFor="cf-name">Votre nom</label>
                  <input id="cf-name" type="text" placeholder="Jean Dupont" required />
                </div>
                <div className="f-group">
                  <label htmlFor="cf-tel">Téléphone</label>
                  <input id="cf-tel" type="tel" placeholder="06.. .. .. .." />
                </div>
              </div>
              <div className="f-group">
                <label htmlFor="cf-email">E-mail</label>
                <input id="cf-email" type="email" placeholder="vous@exemple.fr" required />
              </div>
              <div className="f-group">
                <label htmlFor="cf-msg">Votre message</label>
                <textarea
                  id="cf-msg"
                  placeholder="Votre demande, votre nombre de couverts…"
                  required
                />
              </div>
              <button type="submit" className="btn btn-solid btn-block">
                Envoyer le message
              </button>
            </form>
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
              </span>
            </a>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}
