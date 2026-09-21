'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { CATEGORIES, PRODUCTS, byId } from '@/lib/data';

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';

const SIGNATURES = [
  {
    id: 'menu-demi',
    name: 'Menu Demi Poulet',
    forText: 'pour une belle faim',
    price: '8,90\u00a0€',
    img: `${F}45dd2550dad9.jpg`,
    alt: 'Menu Demi Poulet — poulet braisé doré au four',
    lines: ['1 demi poulet', '1 accompagnement au choix', '1 boisson 33\u00a0cl'],
    solid: false,
  },
  {
    id: 'menu-special',
    name: 'Menu Spécial',
    forText: 'le poulet entier braisé',
    price: '25\u00a0€',
    img: `${F}02f572b69cfe.jpg`,
    alt: 'Menu Spécial — poulet entier braisé au feu de bois',
    lines: ['1 poulet entier braisé', '2 accompagnements au choix', '1 boisson 1,5\u00a0L'],
    solid: true,
  },
  {
    id: 'menu-familial',
    name: 'Menu Familial',
    forText: 'pour toute la tablée',
    price: '25\u00a0€',
    img: `${F}a1fc59d6204b.jpg`,
    alt: 'Menu Familial — deux demi-poulets à partager',
    lines: ['2 demi-poulets', '2 accompagnements au choix', '1 boisson 1,5\u00a0L'],
    solid: false,
  },
];

export default function MenuSection() {
  const { add } = useCart();
  const toast = useToast();
  const [activeCat, setActiveCat] = useState('menus');

  /* Scrollspy de la barre de catégories */
  useEffect(() => {
    const catSpy = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) setActiveCat(en.target.id.replace('cat-', ''));
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    document.querySelectorAll('.menu-cat').forEach((el) => catSpy.observe(el));
    return () => catSpy.disconnect();
  }, []);

  const addMenu = (id: string) => {
    add(id);
    const p = byId(id);
    if (p) toast(`${p.name} ajouté au panier`);
  };

  return (
    <>
      <div className="page-head">
        <div
          className="ph-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=65')",
          }}
          aria-hidden="true"
        />
        <span className="eyebrow">La carte</span>
        <h1 className="page-title">
          Une cuisine <em>généreuse</em>
        </h1>
        <p className="page-sub">Mijotée du matin au soir, servie avec le sourire.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>

      {/* Menus signature avec photo */}
      <div className="signature">
        <div className="container">
          <div className="s-head">
            <span className="eyebrow">Nos formules</span>
            <h2 className="s-title">
              Menus <em>signature</em>
            </h2>
            <span className="orn" aria-hidden="true">
              <i />
            </span>
          </div>
          <div className="ms-grid">
            {SIGNATURES.map((m) => (
              <Reveal as="article" className="ms-card" key={m.id}>
                <div className="ms-img">
                  <SmartImg src={m.img} alt={m.alt} loading="lazy" />
                </div>
                <div className="ms-body">
                  <span className="ms-tag">Formule</span>
                  <h3 className="ms-name">{m.name}</h3>
                  <p className="ms-for">{m.forText}</p>
                  <div className="ms-lines">
                    {m.lines.map((line) => (
                      <div className="ms-line" key={line}>
                        <span>{line}</span>
                        <span className="dots" />
                      </div>
                    ))}
                  </div>
                  <p className="ms-price">{m.price}</p>
                  <button
                    className={`btn btn-block ${m.solid ? 'btn-solid' : 'btn-ghost'}`}
                    style={{ marginTop: '1.4rem' }}
                    onClick={() => addMenu(m.id)}
                  >
                    Ajouter
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <nav className="cat-nav" aria-label="Catégories de la carte">
        {CATEGORIES.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className={`cat-link${activeCat === c.id ? ' active' : ''}`}
          >
            {c.label}
          </a>
        ))}
      </nav>

      <div className="container" id="menuCats">
        {CATEGORIES.map((c) => (
          <div className="menu-cat" id={`cat-${c.id}`} key={c.id}>
            <div className="mc-head">
              <span className="mc-num">— {c.num}</span>
              <h3>{c.label}</h3>
            </div>
            <div className="grid grid-3">
              {PRODUCTS.filter((p) => p.cat === c.id).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
