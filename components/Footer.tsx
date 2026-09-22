import Link from 'next/link';
import Icon from './Icon';

/* Petit coq doré au trait — signature du footer */
function RoosterMark({ size = 46 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* crête */}
      <path d="M23 12c-1.2-2.6.6-4.8 2.8-4 .1-2.8 2.8-4 5-2.3 1.7-2 4.6-1.2 5 1.6" />
      {/* tête, bec, barbillon */}
      <path d="M22.5 13.5c-2.8.8-4.8 2.6-6 4.8l6.2 1.1-3.2 3c1.9 2 4.9 2.1 7 .2" />
      <path d="M27.5 21.5c1.1 2-.1 4.2-2 4.4-1.2.1-2.2-.7-2.4-1.8" />
      {/* corps */}
      <path d="M22.8 26.5c-4.4 4-6.3 9.4-4.2 14.6 2.2 5.6 8.2 8.6 14.4 7.6 7-1.1 11.4-6.2 11.4-12.4" />
      {/* queue */}
      <path d="M44.2 36.3c4.9-2 8-6.9 8-11.9-2.9 1-5.8 1.1-7.9 2.9 1-4-.1-7.8-3-10.7-1 2.9-3 5-5.9 6" />
      {/* aile */}
      <path d="M26.5 33.5c2.5-1.6 5.5-1.8 8.3-.6" />
      {/* pattes */}
      <path d="M29 48.5l-.8 7.5M35.5 48.6l.9 7.4M25 58.5h7M31.5 58.5h7" />
    </svg>
  );
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
                <li><Link href="/commander">Sur place</Link></li>
                <li><Link href="/commander">À emporter</Link></li>
                <li><Link href="/commander">Livraison (dès 25&nbsp;€)</Link></li>
                <li><Link href="/commander">Mon panier</Link></li>
                <li><a href="tel:+33751565951">Par téléphone</a></li>
              </ul>
            </div>
            <div className="fc-col fc-infos">
              <h4>Infos pratiques</h4>
              <ul>
                <li>
                  <span className="fc-ico"><Icon name="pin" size={15} /></span>
                  <span>Avenue Jacques Vogt, 95340 Persan</span>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="clock" size={15} /></span>
                  <span>7j/7 · 11h–14h / 18h–22h30</span>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="phone" size={15} /></span>
                  <a href="tel:+33751565951">07.51.56.59.51</a>
                </li>
                <li>
                  <span className="fc-ico"><Icon name="scooter" size={15} /></span>
                  <span>Livraison Persan &amp; alentours</span>
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
        <p className="fb-sub">Avenue Jacques Vogt, 95340 Persan · 07.51.56.59.51 · Ouvert 7j/7</p>
      </div>
    </footer>
  );
}
