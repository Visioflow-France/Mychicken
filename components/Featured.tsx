'use client';

import Link from 'next/link';
import ProductCard from './ProductCard';
import Icon from './Icon';
import { useMenu } from '@/lib/menu-store';

export default function Featured() {
  const { menu } = useMenu();
  const popular = menu.products.filter((p) => p.popular && p.available !== false).slice(0, 3);

  if (popular.length === 0) return null;

  return (
    <section className="section container" id="best-sellers">
      <div className="s-head">
        <span className="eyebrow">
          <span className="n">01</span>Les incontournables
        </span>
        <h2 className="s-title">
          Nos <em>best-sellers</em>
        </h2>
        <p className="s-sub">Ce que tout Persan vient chercher.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>
      <div id="featuredGrid" className="grid grid-3">
        {popular.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      <p style={{ textAlign: 'center' }}>
        <Link href="/la-carte" className="link-arrow">
          Découvrir toute la carte <Icon name="arrowRight" size={16} strokeWidth={2} />
        </Link>
      </p>
    </section>
  );
}
