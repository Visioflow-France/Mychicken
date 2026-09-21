'use client';

import { useRef, useState } from 'react';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import Icon from './Icon';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { fmt, type Product } from '@/lib/data';
import { useMenu } from '@/lib/menu-store';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const { effective } = useMenu();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const price = effective(p);
  const soldOut = p.available === false;

  /* Le halo doré de la carte suit le pointeur (variables --mx/--my) */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const onAdd = () => {
    if (soldOut) {
      toast(`${p.name} est épuisé pour le moment`);
      return;
    }
    add(p.id);
    toast(`${p.name} ajouté au panier`);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  const flag = soldOut ? 'Épuisé' : price.promo ? 'Promo' : p.popular ? 'Best-seller' : null;

  return (
    <Reveal as="article" className={`p-card${soldOut ? ' sold-out' : ''}`} onPointerMove={onMove}>
      <div className="p-visual">
        <SmartImg src={p.img} alt={p.name} loading="lazy" />
        {flag && <span className={`p-flag${price.promo && !soldOut ? ' promo' : ''}`}>{flag}</span>}
      </div>
      <div className="p-body">
        <h3 className="p-name">{p.name}</h3>
        <p className="p-desc">{p.desc}</p>
        <div className="p-foot">
          <span className="p-price">
            {price.oldPrice != null && <s className="p-old-price">{fmt(price.oldPrice)}</s>}
            {fmt(price.price)}
          </span>
          <button
            className={`p-add${added ? ' ok' : ''}${soldOut ? ' disabled' : ''}`}
            onClick={onAdd}
            aria-live="polite"
            disabled={soldOut}
          >
            {soldOut ? 'Bientôt' : added ? 'Ajouté' : 'Ajouter'}
            <Icon name={soldOut ? 'close' : added ? 'check' : 'plus'} size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
