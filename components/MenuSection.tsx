'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import SmartImg from './SmartImg';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { useMenu } from '@/lib/menu-store';
import { byIdIn, fmt } from '@/lib/data';

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';

/* Les menus signature : structure fixe, mais nom / prix / image suivent
   la carte en temps réel (si l'admin change un prix, l'encart suit). */
const SIGNATURE_DEFS: { id: string; forText: string; lines: string[]; solid: boolean; fallbackImg: string }[] = [
  {
    id: 'menu-demi',
    forText: 'pour une belle faim',
    lines: ['1 demi poulet', '1 accompagnement au choix', '1 boisson 33\u00a0cl'],
    solid: false,
    fallbackImg: `${F}45dd2550dad9.jpg`,
  },
  {
    id: 'menu-special',
    forText: 'le poulet entier braisé',
    lines: ['1 poulet entier braisé', '2 accompagnements au choix', '1 boisson 1,5\u00a0L'],
    solid: true,
    fallbackImg: `${F}02f572b69cfe.jpg`,
  },
  {
    id: 'menu-familial',
    forText: 'pour toute la tablée',
    lines: ['2 demi-poulets', '2 accompagnements au choix', '1 boisson 1,5\u00a0L'],
    solid: false,
    fallbackImg: `${F}a1fc59d6204b.jpg`,
  },
];

export default function MenuSection() {
  const { add } = useCart();
  const toast = useToast();
  const { menu, effective } = useMenu();
  const [activeCat, setActiveCat] = useState<string>(menu.categories[0]?.id || 'menus');

  /* Scrollspy de la barre de catégories — réinstallé à chaque changement de carte */
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
  }, [menu.categories, menu.products]);

  const addMenu = (id: string) => {
    add(id);
    const p = byIdIn(menu, id);
    if (p) toast(`${p.name} ajouté au panier`);
  };

  const signatures = SIGNATURE_DEFS.map((def) => {
    const p = byIdIn(menu, def.id);
    if (!p) return null;
    const price = effective(p);
    return {
      id: def.id,
      name: p.name,
      forText: def.forText,
      price: price.price,
      oldPrice: price.oldPrice,
      img: p.img || def.fallbackImg,
      alt: p.name,
      lines: def.lines,
      solid: def.solid,
    };
  }).filter(Boolean) as {
    id: string; name: string; forText: string; price: number; oldPrice: number | null;
    img: string; alt: string; lines: string[]; solid: boolean;
  }[];

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
      {signatures.length > 0 && (
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
              {signatures.map((m) => (
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
                    <p className="ms-price">
                      {m.oldPrice != null && <s className="p-old-price">{fmt(m.oldPrice)}</s>}
                      {fmt(m.price)}
                    </p>
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
      )}

      <nav className="cat-nav" aria-label="Catégories de la carte">
        {menu.categories.map((c) => (
          <a
            key={c.id}
            href={`#cat-${c.id}`}
            className={`cat-link${activeCat === c.id ? ' active' : ''}`}
          >
            {c.label}
          </a>
        ))}
      </nav>

      <div id="menuCats" className="bg-bois">
        <div className="container">
          {menu.categories.map((c) => (
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
