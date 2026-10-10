'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { useLocationCtx } from '@/lib/location-store';
import Icon from './Icon';

const LINKS = [
  { href: '/la-carte', label: 'Carte' },
  { href: '/notre-histoire', label: 'Histoire' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { count } = useCart();
  const { current, locationId } = useLocationCtx();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* La pilule se renforce au scroll (fond plus opaque, ombre plus dense) */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Menu mobile : panneau déroulant sous la pilule, voile flouté derrière.
     Échap referme (écouteur posé seulement quand le menu est ouvert),
     repasser en vue desktop (> 900px = breakpoint du media query) aussi. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-pill">
        {/* Marque — logo officiel du flyer + wordmark, retour accueil */}
        <Link href="/" className="brand" onClick={closeMenu} aria-label="My Chicken — Accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/logo.png" alt="" width={36} height={36} />
          <span className="brand-text">
            <span className="my">My</span>
            <span className="ck">Chicken</span>
          </span>
        </Link>

        {/* Liens centrés */}
        <nav
          className={`nav-links${open ? ' open' : ''}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) closeMenu();
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? 'active' : ''}
              aria-current={pathname === l.href ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA Commander + panier */}
        <div className="nav-end">
          {/* Indicateur du restaurant — le changement passe UNIQUEMENT par
              le bandeau « Changer de restaurant » (pas ce bouton). */}
          <span
            className="nav-loc"
            title={`Restaurant sélectionné : ${current?.name || 'à choisir'}`}
          >
            <Icon name="pin" size={14} />
            <span>{locationId ? current.city : 'Choisir'}</span>
          </span>
          <Link
            href="/commander"
            className={`nav-cta${pathname === '/commander' ? ' active' : ''}`}
            onClick={closeMenu}
          >
            <Icon name="bag" size={16} strokeWidth={2} />
            <span className="nav-cta-label">Commander</span>
            {/* key={count} : le badge se remonte à chaque ajout et rejoue son animation */}
            {count > 0 && (
              <span key={count} className="cart-badge badge-bounce">
                {count}
              </span>
            )}
          </Link>
          <button
            className="burger"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Menu mobile : voile assombri + flouté derrière le panneau, toujours
         monté pour jouer son fondu à la fermeture — cliquer dessus referme.
         Enfant direct de l'en-tête pour que position:fixed couvre l'écran. */}
      <div
        className={`nav-backdrop${open ? ' open' : ''}`}
        aria-hidden="true"
        onClick={closeMenu}
      />
      <nav className={`nav-drawer${open ? ' open' : ''}`} aria-label="Navigation mobile">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? 'active' : ''}
            aria-current={pathname === l.href ? 'page' : undefined}
            onClick={closeMenu}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
