'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';
import { useMenu } from '@/lib/menu-store';

export default function MenuSection() {
  const { menu } = useMenu();
  /* Seule la catégorie choisie est affichée, directement sous la barre
     de catégories (par défaut : la première). */
  const [activeCat, setActiveCat] = useState<string>(menu.categories[0]?.id || 'menus');

  const visibleCats = menu.categories.filter((c) => c.id === activeCat);

  return (
    <>
      <nav className="cat-nav after-nav" aria-label="Catégories de la carte">
        {menu.categories.map((c) => (
          <button
            key={c.id}
            className={`cat-link${activeCat === c.id ? ' active' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div id="menuCats" className="bg-bois">
        <div className="container">
          {visibleCats.map((c) => (
            <div className="menu-cat" id={`cat-${c.id}`} key={c.id}>
              <div className="mc-head">
                <span className="mc-num">— {c.num}</span>
                <h3>{c.label}</h3>
              </div>
              <div className="grid grid-3">
                {menu.products
                  .filter((p) => p.cat === c.id)
                  .map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
