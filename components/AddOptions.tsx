'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import SmartImg from './SmartImg';
import Icon from './Icon';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { useMenu } from '@/lib/menu-store';
import { fmt, type Product } from '@/lib/data';

/* ================================================================
   Bulle « que mettre avec ? » — s'ouvre ancrée au bouton Ajouter
   du produit (une petite flèche la relie au plat). Propose, en
   toute liberté (tout est facultatif) : un accompagnement, une
   sauce, une boisson ou une pièce en plus. Les choix s'ajoutent au
   panier en lignes séparées, à leur prix. Sur mobile (<640px), la
   bulle se pose en bas d'écran comme une petite fiche.
   ================================================================ */

const OPTION_GROUPS: { cat: string; title: string }[] = [
  { cat: 'accompagnements', title: 'Un accompagnement ?' },
  { cat: 'sauces', title: 'Une sauce ?' },
  { cat: 'boissons', title: 'Une boisson ?' },
  { cat: 'pieces', title: 'Une pièce en plus ?' },
];

type Place = { left: number; top: number; arrow: number; above: boolean; docked: boolean };

export default function AddOptions({
  product,
  anchor,
  onClose,
}: {
  product: Product;
  anchor: HTMLElement | null;
  onClose: () => void;
}) {
  const { menu, effective, priceOf } = useMenu();
  const { add } = useCart();
  const toast = useToast();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState(1);
  const popRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<Place>({ left: 0, top: 0, arrow: 0, above: false, docked: true });

  /* Fermeture Esc — pas de verrouillage du scroll : la bulle suit son ancre */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* La bulle se colle au bouton : dessous, ou au-dessus si ça ne tient
     pas ; recalculé au scroll/resize et quand la hauteur change. */
  useLayoutEffect(() => {
    const placeBubble = () => {
      const pop = popRef.current;
      if (!pop) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!anchor || vw < 640) {
        setPlace({ left: 0, top: 0, arrow: 0, above: false, docked: true });
        return;
      }
      const a = anchor.getBoundingClientRect();
      const w = pop.offsetWidth;
      const h = pop.offsetHeight;
      let left = a.left + a.width / 2 - w / 2;
      left = Math.max(12, Math.min(left, vw - w - 12));
      const gap = 12;
      let top = a.bottom + gap;
      let above = false;
      if (top + h > vh - 12 && a.top - h - gap >= 12) {
        top = a.top - h - gap;
        above = true;
      }
      top = Math.max(12, Math.min(top, Math.max(12, vh - h - 12)));
      const arrow = Math.max(22, Math.min(a.left + a.width / 2 - left, w - 22));
      setPlace({ left, top, arrow, above, docked: false });
    };
    placeBubble();
    window.addEventListener('scroll', placeBubble, true);
    window.addEventListener('resize', placeBubble);
    return () => {
      window.removeEventListener('scroll', placeBubble, true);
      window.removeEventListener('resize', placeBubble);
    };
  }, [anchor, picked, qty]);

  /* Groupes alimentés par la carte en temps réel — on ne propose pas
     une catégorie à un produit qui en fait déjà partie (une sauce
     n'accompagne pas une sauce), ni les produits épuisés. */
  const groups = useMemo(
    () =>
      OPTION_GROUPS.map((g) => ({
        ...g,
        items: menu.products.filter(
          (p) => p.cat === g.cat && p.id !== product.id && p.available !== false
        ),
      })).filter((g) => g.items.length > 0 && product.cat !== g.cat),
    [menu.products, product]
  );

  const price = effective(product);
  const extras = Object.keys(picked).filter((id) => picked[id]);
  const extrasTotal = extras.reduce((s, id) => s + priceOf(id).price, 0);
  const total = (price.price + extrasTotal) * qty;

  const toggle = (id: string) =>
    setPicked((s) => ({ ...s, [id]: !s[id] }));

  const confirm = () => {
    for (let i = 0; i < qty; i++) add(product.id);
    extras.forEach((id) => add(id));
    toast({ img: product.img, title: product.name, note: extras.length > 0 ? `Ajouté (+${extras.length} extra${extras.length > 1 ? 's' : ''})` : 'Ajouté au panier' });
    onClose();
  };

  const style = place.docked
    ? undefined
    : ({ left: place.left, top: place.top, '--ax': `${place.arrow}px` } as CSSProperties);

  /* Rendue en portail sur <body> : aucun ancêtre (animation de page,
     filtres…) ne peut piéger le positionnement fixed de la bulle */
  return createPortal(
    <div className="ao-catcher" onClick={onClose}>
      <div
        ref={popRef}
        className={`ao-pop${place.above ? ' above' : ''}${place.docked ? ' docked' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Options — ${product.name}`}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ao-scroll">
          {/* En-tête compact : la vignette du plat, son nom, son prix */}
          <div className="ao-head">
            <span className="ao-thumb">
              <SmartImg src={product.img} alt={product.name} />
            </span>
            <div className="ao-head-txt">
              <h3>{product.name}</h3>
              <p className="ao-price">
                {price.oldPrice != null && <s className="p-old-price">{fmt(price.oldPrice)}</s>}
                {fmt(price.price)}
              </p>
            </div>
            <button className="ao-close" onClick={onClose} aria-label="Fermer">
              <Icon name="close" size={15} strokeWidth={2.2} />
            </button>
          </div>

          {product.desc && <p className="ao-desc">{product.desc}</p>}

          <div className="ao-groups">
            {groups.map((g) => (
              <section className="ao-group" key={g.cat}>
                <h4>{g.title}</h4>
                <div className="ao-chips">
                  {g.items.map((it) => {
                    const on = Boolean(picked[it.id]);
                    return (
                      <button
                        type="button"
                        key={it.id}
                        className={`ao-chip${on ? ' on' : ''}`}
                        onClick={() => toggle(it.id)}
                        aria-pressed={on}
                      >
                        <span className="ao-chip-name">{it.name}</span>
                        <span className="ao-chip-price">+{fmt(priceOf(it.id).price)}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
            <p className="ao-free">Tout est facultatif — composez comme vous voulez.</p>
          </div>

          <div className="ao-foot">
            <div className="ao-qty" aria-label="Quantité">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Retirer un exemplaire">
                <Icon name="minus" size={14} strokeWidth={2.4} />
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Ajouter un exemplaire">
                <Icon name="plus" size={14} strokeWidth={2.4} />
              </button>
            </div>
            <button type="button" className="btn btn-solid ao-confirm" onClick={confirm}>
              Ajouter au panier · {fmt(total)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
