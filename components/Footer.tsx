'use client';

import Link from 'next/link';
import Icon from './Icon';
import { useLocationCtx } from '@/lib/location-store';

/* Logo officiel (découpé du flyer) — signature du footer */
function RoosterMark({ size = 46 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="" width={size} height={size} style={{ width: size, height: size, borderRadius: '50%' }} />;
}

/* Icônes sociales carrées — Instagram, TikTok, Facebook (sans lien pour l'instant) */
function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="fc-social" role="img" aria-label={label} title={label}>
      {children}
    </span>
  );
}

const instagramIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5.5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
  </svg>
);

const tiktokIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.6 3c.3 2.3 1.8 3.9 4.1 4.1v3.2c-1.6 0-3-.5-4.1-1.4v6.6c0 3.6-2.7 6-6 6-3.2 0-5.8-2.4-5.8-5.6 0-3.5 3.1-6.1 6.7-5.6v3.3c-1.7-.6-3.5.6-3.5 2.3 0 1.3 1.1 2.4 2.6 2.4 1.6 0 2.8-1.1 2.8-2.8V3h3.2Z" />
  </svg>
);

const facebookIcon = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.5 8.2h2.6V4.6h-2.6c-2.6 0-4.2 1.7-4.2 4.3v2.4H7.5v3.6h2.8v6.5h3.7v-6.5h2.9l.5-3.6h-3.4V9.3c0-.7.4-1.1 1-1.1Z" />
  </svg>
);

/* Footer — carte ambrée « bulle » contenant le panneau sombre du visuel :
   fond photo (frites / poulet), coq doré + logo script, 4 colonnes de liens,
   tirets dorés, note manuscrite et icônes sociales. */
export default function Footer() {
  const { current, openGate } = useLocationCtx();
  const telHref = `tel:+33${current.phone.replace(/\D/g, '').slice(1)}`;
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-card">
          {/* En-tête : coq doré + logo script */}
          <div className="fc-head">
            <span className="fc-rooster" aria-hidden="true">
              <RoosterMark />
            </span>
            <p className="fc-logo">My Chicken</p>
            <p className="fc-note">
              Rejoignez la famille My Chicken&nbsp;!
              <svg className="fc-note-line" viewBox="0 0 150 9" fill="none" aria-hidden="true">
                <path d="M3 6.2C34 2 96 1.4 147 4.4" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </p>
          </div>

          {/* 4 colonnes comme sur le visuel */}
          <div className="fc-grid">
            <div className="fc-col">
              <h4>Nos formules</h4>
              <ul>
                <li><Link href="/la-carte">Menus</Link></li>
                <li><Link href="/la-carte">Sandwichs</Link></li>
                <li><Link href="/la-carte">Poulet &amp; grillades</Link></li>
                <li><Link href="/la-carte">Accompagnements</Link></li>
                <li><Link href="/la-carte">Desserts &amp; boissons</Link></li>
              </ul>
            </div>
            <div className="fc-col">
              <h4>Commander</h4>
              <ul>
                <li><Link href="/commander">À emporter</Link></li>
                <li><Link href="/commander">Livraison (dès {current.minDelivery}&nbsp;€)</Link></li>
                <li><Link href="/commander">Mon panier</Link></li>
              </ul>
            </div>
            <div className="fc-col fc-infos">
              <h4>Infos pratiques</h4>
              <ul>
                <li>
                  <span className="fc-ico"><Icon name="pin" size={15} /></span>
                  <button className="fc-loc" onClick={openGate} title="Changer de restaurant">
                    {current.address}, {current.postal} {current.city}
                  </button>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="clock" size={15} /></span>
                  <span>{current.hours}</span>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="phone" size={15} /></span>
                  <a href={telHref}>{current.phone}</a>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="scooter" size={15} /></span>
                  <span>Livraison {current.city} &amp; alentours</span>
                </li>
              </ul>
            </div>
            <div className="fc-col">
              <h4>Suivez-nous</h4>
              <div className="fc-socials">
                <SocialIcon label="Instagram">{instagramIcon}</SocialIcon>
                <SocialIcon label="TikTok">{tiktokIcon}</SocialIcon>
                <SocialIcon label="Facebook">{facebookIcon}</SocialIcon>
              </div>
              <p className="fc-social-hint">Bientôt en ligne&nbsp;!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre légale */}
      <div className="footer-bottom">
        <p className="fb-links">
          <Link href="/mentions-legales">Mentions légales</Link>
          <span aria-hidden="true">·</span>
          <Link href="/cgv">CGV</Link>
          <span aria-hidden="true">·</span>
          <Link href="/politique-de-confidentialite">Politique de confidentialité</Link>
        </p>
        <p>
          © <span suppressHydrationWarning>{new Date().getFullYear()}</span>{' '}
          <b>MY CHICKEN</b> — SASU au capital de 1&nbsp;000&nbsp;€ · RCS Meaux 928&nbsp;281&nbsp;278 · TVA FR36928281278
        </p>
        <p className="fb-sub">
          Saint-Mard — Av. de la Font du Berger · Persan — Av. Jacques Vogt · Ouvert 7j/7
        </p>
      </div>
    </footer>
  );
}
