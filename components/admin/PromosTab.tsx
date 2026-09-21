'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { useToast } from '@/lib/toast';
import { fmt, promoPrice, type MenuData, type ProductPromo, type PromoCode } from '@/lib/data';

type Mutate = (fn: (d: MenuData) => MenuData) => void;

export default function PromosTab({ draft, mutate }: { draft: MenuData; mutate: Mutate }) {
  const toast = useToast();
  /* promo produit : formulaire */
  const [ppProduct, setPpProduct] = useState('');
  const [ppType, setPpType] = useState<ProductPromo['type']>('percent');
  const [ppValue, setPpValue] = useState('');
  /* code panier : formulaire */
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<PromoCode['type']>('percent');
  const [cValue, setCValue] = useState('');
  const [cMin, setCMin] = useState('');

  const setPromo = (id: string, promo: ProductPromo | undefined) =>
    mutate((d) => {
      const promos = { ...d.promos };
      if (promo) promos[id] = promo;
      else delete promos[id];
      return { ...d, promos };
    });

  const addProductPromo = () => {
    const value = Number(ppValue.replace(',', '.'));
    if (!ppProduct) return toast('Choisissez un produit');
    if (!(value > 0)) return toast('Indiquez une valeur');
    if (ppType === 'percent' && value > 100) return toast('Maximum 100 %');
    setPromo(ppProduct, { type: ppType, value: Math.round(value * 100) / 100 });
    setPpProduct('');
    setPpValue('');
    toast('Promo ajoutée au brouillon');
  };

  const addCode = () => {
    const code = cCode.trim().toUpperCase();
    const value = Number(cValue.replace(',', '.'));
    if (code.length < 3) return toast('Code trop court (3 caractères min.)');
    if (!(value > 0)) return toast('Indiquez une valeur');
    if (draft.promoCodes.some((c) => c.code === code)) return toast('Ce code existe déjà');
    const min = Number(cMin.replace(',', '.'));
    mutate((d) => ({
      ...d,
      promoCodes: [
        ...d.promoCodes,
        { code, type: cType, value: Math.round(value * 100) / 100, active: true, ...(min > 0 ? { minTotal: min } : {}) },
      ],
    }));
    setCCode('');
    setCValue('');
    setCMin('');
    toast('Code promo créé');
  };

  const patchCode = (code: string, patch: Partial<PromoCode>) =>
    mutate((d) => ({
      ...d,
      promoCodes: d.promoCodes.map((c) => (c.code === code ? { ...c, ...patch } : c)),
    }));

  const removeCode = (code: string) =>
    mutate((d) => ({ ...d, promoCodes: d.promoCodes.filter((c) => c.code !== code) }));

  const promoEntries = Object.entries(draft.promos);
  const productName = (id: string) => draft.products.find((p) => p.id === id)?.name || id;

  return (
    <div className="admin-stack">
      {/* ---------- Bandeau du site ---------- */}
      <section className="admin-panel">
        <h3 className="ap-title">
          <Icon name="flame" size={16} /> Bandeau promo du site
        </h3>
        <p className="ap-help">
          S&apos;affiche en haut de toutes les pages, en direct (ex. « −20 % sur tout le menu ce week-end »).
        </p>
        <div className="ap-addrow">
          <input
            type="text"
            value={draft.banner.text}
            onChange={(e) => mutate((d) => ({ ...d, banner: { ...d.banner, text: e.target.value } }))}
            placeholder="🎉 −20 % sur tous les menus ce week-end !"
            aria-label="Texte du bandeau"
          />
          <label className="check-opt solid-toggle">
            <input
              type="checkbox"
              checked={draft.banner.active}
              onChange={(e) => mutate((d) => ({ ...d, banner: { ...d.banner, active: e.target.checked } }))}
            />
            {draft.banner.active ? 'Affiché' : 'Masqué'}
          </label>
        </div>
      </section>

      {/* ---------- Promos produit ---------- */}
      <section className="admin-panel">
        <h3 className="ap-title">
          <Icon name="tag" size={16} /> Promos par produit
        </h3>
        <div className="ap-addrow wrap">
          <select value={ppProduct} onChange={(e) => setPpProduct(e.target.value)} aria-label="Produit">
            <option value="">Choisir un produit…</option>
            {draft.products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {fmt(p.price)}
              </option>
            ))}
          </select>
          <select value={ppType} onChange={(e) => setPpType(e.target.value as ProductPromo['type'])} aria-label="Type de promo">
            <option value="percent">− %</option>
            <option value="amount">− €</option>
            <option value="price">Nouveau prix</option>
          </select>
          <input
            type="number"
            step="0.10"
            min="0"
            value={ppValue}
            onChange={(e) => setPpValue(e.target.value)}
            placeholder="Valeur"
            aria-label="Valeur"
          />
          <button className="btn btn-solid" onClick={addProductPromo}>
            <Icon name="plus" size={14} strokeWidth={2.4} /> Ajouter
          </button>
        </div>

        {promoEntries.length > 0 ? (
          <div className="ap-list">
            {promoEntries.map(([id, promo]) => {
              const p = draft.products.find((x) => x.id === id);
              return (
                <div className="ap-row" key={id}>
                  <div className="ap-info">
                    <b>{productName(id)}</b>
                    <span className="ap-cat">
                      {promo.type === 'percent' && `−${promo.value} %`}
                      {promo.type === 'amount' && `−${fmt(promo.value)}`}
                      {promo.type === 'price' && `prix fixe ${fmt(promo.value)}`}
                    </span>
                  </div>
                  <span className="ap-price">
                    {p && <><s>{fmt(p.price)}</s> {fmt(promoPrice(p.price, promo))}</>}
                  </span>
                  <div className="ap-actions">
                    <button className="icon-btn danger" title="Retirer la promo" onClick={() => setPromo(id, undefined)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="ap-empty">Aucune promo produit pour le moment.</p>
        )}
      </section>

      {/* ---------- Codes promo panier ---------- */}
      <section className="admin-panel">
        <h3 className="ap-title">
          <Icon name="lock" size={16} /> Codes promo (panier entier)
        </h3>
        <div className="ap-addrow wrap">
          <input
            type="text"
            value={cCode}
            onChange={(e) => setCCode(e.target.value.toUpperCase())}
            placeholder="CODE"
            aria-label="Code"
            style={{ letterSpacing: '.12em', textTransform: 'uppercase' }}
          />
          <select value={cType} onChange={(e) => setCType(e.target.value as PromoCode['type'])} aria-label="Type de code">
            <option value="percent">− %</option>
            <option value="amount">− €</option>
          </select>
          <input type="number" step="0.10" min="0" value={cValue} onChange={(e) => setCValue(e.target.value)} placeholder="Valeur" aria-label="Valeur" />
          <input type="number" step="1" min="0" value={cMin} onChange={(e) => setCMin(e.target.value)} placeholder="Min. achat € (facultatif)" aria-label="Minimum d'achat" />
          <button className="btn btn-solid" onClick={addCode}>
            <Icon name="plus" size={14} strokeWidth={2.4} /> Créer
          </button>
        </div>

        {draft.promoCodes.length > 0 ? (
          <div className="ap-list">
            {draft.promoCodes.map((c) => (
              <div className="ap-row" key={c.code}>
                <b className="ap-code">{c.code}</b>
                <span className="ap-cat">
                  {c.type === 'percent' ? `−${c.value} %` : `−${fmt(c.value)}`}
                  {c.minTotal ? ` · dès ${fmt(c.minTotal)}` : ''}
                </span>
                <label className="switch">
                  <input type="checkbox" checked={c.active} onChange={(e) => patchCode(c.code, { active: e.target.checked })} />
                  <span />
                </label>
                <div className="ap-actions">
                  <button className="icon-btn danger" title="Supprimer" onClick={() => removeCode(c.code)}>
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ap-empty">Aucun code promo. Les clients pourront en saisir un au moment de payer.</p>
        )}
      </section>
    </div>
  );
}
