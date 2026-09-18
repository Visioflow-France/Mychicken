'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart';

const LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#carte', label: 'La Carte' },
  { href: '#histoire', label: 'Notre Histoire' },
  { href: '#contact', label: 'Contact' },
];

const SPIED_SECTIONS = ['accueil', 'carte', 'histoire', 'contact', 'panier'];

export default function Navbar() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  /* Fond de la navbar au scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Menu mobile : on bloque le scroll de la page quand il est ouvert */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  /* Scrollspy : met en évidence le lien de la section visible */
  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActive(en.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    SPIED_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) spy.observe(el);
    });
    return () => spy.disconnect();
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <header className={`navbar${scrolled ? ' scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#accueil" className="brand">
          <span className="my">My</span>
          <span className="ck">Chicken</span>
        </a>
        <button
          className="burger"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '✕' : '☰'}
        </button>
        <nav
          className={`nav-links${open ? ' open' : ''}`}
          onClick={(e) => {
            if ((e.target as HTMLElement).tagName === 'A') closeMenu();
          }}
        >
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={active === l.href.slice(1) ? 'active' : ''}>
              {l.label}
            </a>
          ))}
          <a
            href="#panier"
            className={`cart-link${active === 'panier' ? ' active' : ''}`}
          >
            Panier
            {/* key={count} : le badge se remonte à chaque ajout et rejoue son animation */}
            <span
              key={count}
              className={`cart-badge${count > 0 ? ' badge-bounce' : ''}`}
            >
              {count}
            </span>
          </a>
        </nav>
      </div>
    </header>
  );
}
