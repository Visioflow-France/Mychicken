'use client';

import { useEffect } from 'react';
import { useMenu } from '@/lib/menu-store';

/* Bandeau promo éditable en temps réel depuis /admin → Réglages.
   Quand il est actif, il se cale au-dessus de la navbar (la mise en
   page suit via la variable CSS --promo-strip-h). */
export default function PromoBanner() {
  const { menu } = useMenu();
  const active = menu.banner.active && menu.banner.text.trim().length > 0;

  useEffect(() => {
    document.documentElement.style.setProperty('--promo-strip-h', active ? '42px' : '0px');
    document.body.style.paddingTop = active ? '42px' : '';
    return () => {
      document.documentElement.style.setProperty('--promo-strip-h', '0px');
      document.body.style.paddingTop = '';
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="promo-strip" role="status">
      <span className="ps-text">{menu.banner.text}</span>
    </div>
  );
}
