'use client';

import { useEffect, useRef, useState } from 'react';
import SmartImg from './SmartImg';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { CONFIG, byId, fmt } from '@/lib/data';

const MODES = [
  { value: 'takeaway', label: 'À emporter' },
  { value: 'dinein', label: 'Sur place' },
  { value: 'delivery', label: '🛵 Livraison (dès 25\u00a0€)' },
];

export default function CartSection() {
  const { cart, count, total, setQty, remove, clear } = useCart();
  const toast = useToast();
  const [mode, setMode] = useState('takeaway');
  const [orderNum, setOrderNum] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);

  /* Une nouvelle commande efface l'écran de confirmation précédent */
  useEffect(() => {
    if (orderNum && count > 0) setOrderNum(null);
  }, [count, orderNum]);

  const sub = total;
  const fee = mode === 'delivery' ? CONFIG.deliveryFee : 0;
  const lacks = CONFIG.minDelivery - sub;
  const deliveryBlocked = mode === 'delivery' && lacks > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0) return;
    const phone = phoneRef.current?.value.trim() ?? '';
    if (phone.replace(/\D/g, '').length < 9) {
      toast("Merci d'indiquer un téléphone valide");
      phoneRef.current?.focus();
      return;
    }
    if (mode === 'delivery') {
      const addr = addrRef.current?.value.trim() ?? '';
      if (addr.length < 8) {
        toast("Merci d'indiquer votre adresse de livraison");
        addrRef.current?.focus();
        return;
      }
    }
    const num = 'MC-' + Date.now().toString(36).toUpperCase().slice(-6);
    setOrderNum(num);
    clear();
    formRef.current?.reset();
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('panier')
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    toast(`Commande ${num} enregistrée !`);
  };

  const showSuccess = orderNum !== null;
  const showEmpty = !showSuccess && count === 0;
  const showCheckout = !showSuccess && count > 0;

  return (
    <>
      <div className="page-head">
        <div
          className="ph-bg"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=1600&q=65')",
          }}
          aria-hidden="true"
        />
        <span className="eyebrow">Votre commande</span>
        <h1 className="page-title">
          Votre <em>panier</em>
        </h1>
        <p className="page-sub">Encore quelques clics et tout arrive chaud.</p>
        <span className="orn" aria-hidden="true">
          <i />
        </span>
      </div>

      <div className="section container">
        {showEmpty && (
          <div className="empty-state" id="emptyCart">
            <span className="ring">
              <SmartImg
                src="https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70"
                alt="Poulet croustillant qui n'attend que vous"
                loading="lazy"
              />
            </span>
            <h2>Votre panier est vide</h2>
            <p>Le poulet mijoté n&apos;attend que vous — jetez un œil à nos best-sellers&nbsp;!</p>
            <a href="#carte" className="btn btn-solid">
              Voir la carte
            </a>
          </div>
        )}

        {showCheckout && (
          <div className="checkout-layout" id="checkoutWrap">
            <div>
              <h3 className="c-sub">Votre commande</h3>
              <button
                className="clear-cart"
                type="button"
                onClick={() => {
                  clear();
                  toast('Panier vidé');
                }}
              >
                Vider le panier ✕
              </button>
              <div id="cartItems">
                {Object.entries(cart).map(([id, q]) => {
                  const p = byId(id);
                  if (!p) return null;
                  return (
                    <div className="cart-item" key={id}>
                      <span className="ci-thumb">
                        <SmartImg src={p.img} alt={p.name} loading="lazy" />
                      </span>
                      <div>
                        <p className="ci-name">{p.name}</p>
                        <p className="ci-unit">{fmt(p.price)} / unité</p>
                        <div className="ci-controls">
                          <button
                            className="qty-btn"
                            onClick={() => setQty(id, -1)}
                            aria-label={`Retirer un ${p.name}`}
                          >
                            −
                          </button>
                          <span className="qty-value">{q}</span>
                          <button
                            className="qty-btn"
                            onClick={() => setQty(id, 1)}
                            aria-label={`Ajouter un ${p.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="ci-side">
                        <span className="ci-price">{fmt(p.price * q)}</span>
                        <button
                          className="ci-remove"
                          onClick={() => remove(id)}
                          aria-label={`Supprimer ${p.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <aside>
              <h3 className="c-sub">Récapitulatif</h3>
              <div className="summary">
                <div className="sum-row">
                  <span>Sous-total</span>
                  <span id="sumSubtotal">{fmt(sub)}</span>
                </div>
                {mode === 'delivery' && (
                  <div className="sum-row" id="sumFeeRow">
                    <span>Frais de livraison</span>
                    <span id="sumFee">{fmt(fee)}</span>
                  </div>
                )}
                <div className="sum-row total">
                  <span>Total</span>
                  <span id="sumTotal">{fmt(sub + fee)}</span>
                </div>
                <p className={`sum-note${mode === 'delivery' && deliveryBlocked ? ' warn' : ''}`} id="sumNote">
                  {mode === 'delivery'
                    ? deliveryBlocked
                      ? `Livraison possible à partir de ${fmt(CONFIG.minDelivery)} d'achat.`
                      : '🛵 Livraison disponible à Persan et alentour.'
                    : ''}
                </p>
              </div>

              <form className="order-form panel" ref={formRef} onSubmit={submit} style={{ padding: '1.9rem' }}>
                <fieldset>
                  <legend>Mode</legend>
                  {MODES.map((m) => (
                    <label className="radio-opt" key={m.value}>
                      <input
                        type="radio"
                        name="mode"
                        value={m.value}
                        checked={mode === m.value}
                        onChange={() => setMode(m.value)}
                      />
                      {m.label}
                    </label>
                  ))}
                </fieldset>

                {mode === 'delivery' && (
                  <div className="f-group" id="deliveryFields">
                    <label htmlFor="dAddr">Adresse de livraison</label>
                    <input
                      ref={addrRef}
                      id="dAddr"
                      type="text"
                      placeholder="12 rue des Écoles, 95340 Persan"
                    />
                  </div>
                )}
                <div className="f-group">
                  <label htmlFor="dPhone">Téléphone</label>
                  <input ref={phoneRef} id="dPhone" type="tel" placeholder="06.. .. .. .." required />
                </div>
                <div className="f-group">
                  <label htmlFor="dNote">
                    Note pour la cuisine{' '}
                    <span style={{ textTransform: 'none', letterSpacing: 0 }}>(facultatif)</span>
                  </label>
                  <textarea
                    id="dNote"
                    style={{ minHeight: '80px' }}
                    placeholder="Sans sauce algérienne, sonner à gauche…"
                  />
                </div>
                {mode === 'delivery' && deliveryBlocked && (
                  <p className="sum-note warn" id="deliveryMsg">
                    Ajoutez encore {fmt(lacks)} pour bénéficier de la livraison.
                  </p>
                )}
                <button
                  type="submit"
                  className="btn btn-solid btn-block"
                  id="submitBtn"
                  disabled={deliveryBlocked}
                  style={
                    deliveryBlocked
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : { opacity: 1, cursor: 'pointer' }
                  }
                >
                  Confirmer la commande
                </button>
                <p className="secure-note">
                  <span aria-hidden="true">🔒</span> Commande confirmée par téléphone avant
                  préparation
                </p>
              </form>
            </aside>
          </div>
        )}

        {showSuccess && (
          <div className="order-success" id="orderSuccess">
            <div className="success-ring" aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <path d="M10 21 L17 28 L30 13" />
              </svg>
            </div>
            <h2>Merci pour votre commande&nbsp;!</h2>
            <span className="order-num" id="orderNum">
              {orderNum}
            </span>
            <p>Votre commande est enregistrée. Nous vous appelons très vite pour la confirmer.</p>
            <p>Gardez votre téléphone à portée de main — à tout de suite&nbsp;! 🍗</p>
            <div className="os-actions">
              <a href="#accueil" className="btn btn-ghost">
                Retour à l&apos;accueil
              </a>
              <a href="#carte" className="btn btn-solid">
                Voir la carte
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
