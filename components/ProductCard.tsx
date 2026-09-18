'use client';

import Reveal from './Reveal';
import SmartImg from './SmartImg';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { fmt, type Product } from '@/lib/data';

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const toast = useToast();

  return (
    <Reveal as="article" className="p-card">
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
            className="p-add"
            onClick={() => {
              add(p.id);
              toast(`${p.name} ajouté au panier`);
            }}
          >
            Ajouter +
          </button>
        </div>
      </div>
    </Reveal>
  );
}
