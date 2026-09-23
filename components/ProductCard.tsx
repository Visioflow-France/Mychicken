'use client';

import { useState } from 'react';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import Icon from './Icon';
import AddOptions from './AddOptions';
import { useMenu } from '@/lib/menu-store';
import { fmt, type Product } from '@/lib/data';

export default function ProductCard({ p }: { p: Product }) {
  const { effective } = useMenu();
  const [askOptions, setAskOptions] = useState(false);

  const price = effective(p);
  const soldOut = p.available === false;

  /* Le halo doré de la carte suit le pointeur (variables --mx/--my) */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  /* « Ajouter » ouvre la modale de propositions (accompagnement,
     sauce, boisson, pièce en plus) — l'ajout sec se fait dedans. */
  const onAdd = () => {
    if (!soldOut) setAskOptions(true);
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
            className={`p-add${soldOut ? ' disabled' : ''}`}
            onClick={onAdd}
            disabled={soldOut}
          >
            {soldOut ? 'Bientôt' : 'Ajouter'}
            <Icon name={soldOut ? 'close' : 'plus'} size={13} strokeWidth={2.4} />
          </button>
        </div>
      </div>
      {askOptions && <AddOptions product={p} onClose={() => setAskOptions(false)} />}
    </Reveal>
  );
}
