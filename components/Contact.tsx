'use client';

import { useRef } from 'react';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import { useToast } from '@/lib/toast';

const INFOS = [
  {
    title: 'Adresse',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=70',
    alt: 'Devanture du restaurant',
    content: <>Avenue Jacques Vogt<br />95340 Persan</>,
  },
  {
    title: 'Téléphone',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=70',
    alt: 'Téléphone',
    content: <a href="tel:+33751565951">07.51.56.59.51</a>,
  },
  {
    title: 'Horaires',
    img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=300&q=70',
    alt: 'Salle du restaurant le soir',
    content: <>7j/7 · 11h–14h / 18h–22h30</>,
  },
  {
    title: 'Livraison',
    img: 'https://images.unsplash.com/photo-1600854401200-3dc4631766b6?auto=format&fit=crop&w=300&q=70',
    alt: 'Livraison à domicile',
    content: <>Persan &amp; communes alentour, dès 25&nbsp;€ d&apos;achat.</>,
  },
];

export default function Contact() {
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Message envoyé ! Nous vous répondons très vite.');
    formRef.current?.reset();
  };

  return (
    <>
      <div className="page-head">
        <div
          className="ph-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=65')",
          }}
          aria-hidden="true"
        />
        <span className="eyebrow">Contact</span>
        <h1 className="page-title">
          Parlons-en <em>autour d&apos;un pilon</em>
        </h1>
        <p className="page-sub">Une question, une grande tablée&nbsp;? Écrivez-nous ou passez nous voir.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>

      <div className="section container">
        <div className="contact-grid">
          <Reveal className="panel">
            <h3>Nous trouver</h3>
            {INFOS.map((info) => (
              <div className="c-line" key={info.title}>
                <span className="c-ico">
                  <SmartImg src={info.img} alt={info.alt} loading="lazy" />
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
            title="My CHICKEN sur la carte — Avenue Jacques Vogt, Persan"
            loading="lazy"
            src="https://www.google.com/maps?q=Avenue%20Jacques%20Vogt%2C%2095340%20Persan&output=embed"
          />
        </Reveal>
      </div>
    </>
  );
}
