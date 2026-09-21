'use client';

import { useRef, useState } from 'react';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import Icon from './Icon';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { fmt, type Product } from '@/lib/data';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Le halo doré de la carte suit le pointeur (variables --mx/--my) */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const onAdd = () => {
    add(p.id);
    toast(`${p.name} ajouté au panier`);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <Reveal as="article" className="p-card" onPointerMove={onMove}>
      <div className="p-visual">
        <SmartImg src={p.img} alt={p.name} loading="lazy" />
        {p.popular && <span className="p-flag">Best-seller</span>}
      </div>
      <div className="p-body">
        <h3 className="p-name">{p.name}</h3>
        <p className="p-desc">{p.desc}</p>
        <div className="p-foot">
          <span className="p-price">{fmt(p.price)}</span>
          <button
            className={`p-add${added ? ' ok' : ''}`}
            onClick={onAdd}
            aria-live="polite"
          >
            {added ? 'Ajouté' : 'Ajouter'}
            <Icon
              name={added ? 'check' : 'plus'}
              size={13}
              strokeWidth={2.4}
            />
          </button>
        </div>
      </div>
    </Reveal>
  );
}
