'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

/** Bouton flottant « retour en haut », visible après avoir défilé */
export default function ScrollTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`scroll-top${show ? ' show' : ''}`}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }
      aria-label="Remonter en haut de la page"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      <Icon name="arrowUp" size={19} strokeWidth={2.2} />
    </button>
  );
}
