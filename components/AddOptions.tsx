'use client';

import { useEffect, useMemo, useState } from 'react';
import SmartImg from './SmartImg';
import Icon from './Icon';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { useMenu } from '@/lib/menu-store';
import { fmt, type Product } from '@/lib/data';

/* ================================================================
   Modale « que mettre avec ? » — ouverte par « Ajouter ».
   Propose, en toute liberté (tout est facultatif) :
   un accompagnement, une sauce, une boisson ou une pièce en plus.
   Les choix s'ajoutent au panier en lignes séparées, à leur prix.
   ================================================================ */

const OPTION_GROUPS: { cat: string; title: string }[] = [
  { cat: 'accompagnements', title: 'Un accompagnement ?' },
  { cat: 'sauces', title: 'Une sauce ?' },
  { cat: 'boissons', title: 'Une boisson ?' },
  { cat: 'pieces', title: 'Une pièce en plus ?' },
];

export default function AddOptions({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { menu, effective, priceOf } = useMenu();
  const { add } = useCart();
  const toast = useToast();
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState(1);

  /* Scroll de la page verrouillé tant que la modale est ouverte + fermeture Esc */
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

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

  return (
    <div className="ao-backdrop" onClick={onClose}>
      <div
        className="ao-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Options — ${product.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ao-close" onClick={onClose} aria-label="Fermer">
          <Icon name="close" size={16} strokeWidth={2.2} />
        </button>

        {/* Le plat d'abord : sa photo domine l'en-tête de la modale */}
        <div className="ao-hero">
          <SmartImg src={product.img} alt={product.name} />
          <div className="ao-hero-veil" aria-hidden="true" />
          <div className="ao-hero-txt">
            <h3>{product.name}</h3>
            <p className="ao-price">
              {price.oldPrice != null && <s className="p-old-price">{fmt(price.oldPrice)}</s>}
              {fmt(price.price)}
            </p>
          </div>
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
  );
}
