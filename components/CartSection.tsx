'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import SmartImg from './SmartImg';
import Icon, { type IconName } from './Icon';
import { useCart } from '@/lib/cart';
import { useToast } from '@/lib/toast';
import { useMenu } from '@/lib/menu-store';
import { useLocationCtx } from '@/lib/location-store';
import { fmt, type Order } from '@/lib/data';
import { addDemoOrder } from '@/lib/orders-store';

const MODES = (minDelivery: number): { value: string; label: string; icon: IconName }[] => [
  { value: 'takeaway', label: 'À emporter', icon: 'bag' },
  { value: 'dinein', label: 'Sur place', icon: 'utensils' },
  { value: 'delivery', label: `Livraison (dès ${minDelivery}\u00a0€)`, icon: 'scooter' },
];

const PAYMENTS: { value: 'card' | 'phone'; label: string; hint: string }[] = [
  { value: 'card', label: 'Carte bancaire', hint: 'Paiement sécurisé immédiat' },
  { value: 'phone', label: 'Par téléphone', hint: 'On vous appelle pour confirmer' },
];

type SuccessState = { num: string; paid: boolean; total?: number | null };

export default function CartSection() {
  const { cart, count, total, setQty, remove, clear } = useCart();
  const { menu, source, priceOf, findCode } = useMenu();
  const { current, locationId, openGate } = useLocationCtx();
  const toast = useToast();
  const [mode, setMode] = useState('takeaway');
  const [payment, setPayment] = useState<'card' | 'phone'>('card');
  const [orderNum, setOrderNum] = useState<SuccessState | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const detailRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* Une nouvelle commande efface l'écran de confirmation précédent */
  useEffect(() => {
    if (orderNum && count > 0) setOrderNum(null);
  }, [count, orderNum]);

  /* Retour de Stripe : ?paid=1&session_id=… ou ?canceled=1 */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('canceled')) {
      toast('Paiement annulé — votre panier est intact');
      window.history.replaceState({}, '', '/commander');
      return;
    }
    if (!params.get('paid') || !sessionId) return;
    window.history.replaceState({}, '', '/commander');
    (async () => {
      try {
        const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);
        const data = (await res.json()) as { paid?: boolean; num?: string | null; total?: number | null };
        setOrderNum({ num: data.num || 'MC', paid: Boolean(data.paid), total: data.total });
        clear();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        toast(`Impossible de vérifier le paiement — contactez-nous au ${current.phone}`);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closed = !current.open;

  const sub = total;
  const promo = appliedCode ? findCode(appliedCode) : undefined;
  const codeValid = Boolean(promo) && sub >= (promo?.minTotal || 0);
  const discount = !codeValid
    ? 0
    : promo!.type === 'percent'
      ? Math.round(sub * promo!.value) / 100
      : Math.min(promo!.value, sub);
  const discounted = Math.round((sub - discount) * 100) / 100;
  const fee = mode === 'delivery' ? current.deliveryFee : 0;
  const lacks = current.minDelivery - discounted;
  const deliveryBlocked = mode === 'delivery' && lacks > 0;

  const applyCode = () => {
    const wanted = codeInput.trim().toUpperCase();
    if (!wanted) return;
    if (!findCode(wanted)) {
      toast('Ce code promo n\'est pas (ou plus) valide');
      return;
    }
    setAppliedCode(wanted);
    toast(`Code ${wanted} appliqué !`);
  };

  const customerData = useCallback(():
    | { ok: false; error: string }
    | {
        ok: true;
        value: {
          name?: string;
          phone: string;
          address?: string;
          building?: string;
          door?: string;
          accessCode?: string;
          intercom?: string;
          floor?: string;
          note?: string;
        };
      } => {
    const phone = phoneRef.current?.value.trim() ?? '';
    if (phone.replace(/\D/g, '').length < 9) {
      phoneRef.current?.focus();
      return { ok: false, error: "Merci d'indiquer un téléphone valide" };
    }
    const name = nameRef.current?.value.trim() ?? '';
    if (name.length < 3) {
      nameRef.current?.focus();
      return { ok: false, error: 'Merci d\u2019indiquer votre nom et prénom' };
    }
    if (mode === 'delivery') {
      const addr = addrRef.current?.value.trim() ?? '';
      if (addr.length < 8) {
        addrRef.current?.focus();
        return { ok: false, error: "Merci d'indiquer votre adresse de livraison" };
      }
      // L'adresse doit contenir un code postal couvert par le restaurant sélectionné
      const cpMatch = addr.match(/\b(\d{5})\b/);
      if (!cpMatch || !current.deliveryZones.includes(cpMatch[1])) {
        addrRef.current?.focus();
        return {
          ok: false,
          error: `Livraison non couverte à cette adresse — My Chicken ${current.city} livre les codes postaux : ${current.deliveryZones.join(', ')}`,
        };
      }
    }
    const detail = (k: string) => detailRefs.current[k]?.value.trim() || undefined;
    return {
      ok: true,
      value: {
        name,
        phone,
        address: mode === 'delivery' ? addrRef.current?.value.trim() : undefined,
        ...(mode === 'delivery'
          ? {
              building: detail('building'),
              door: detail('door'),
              accessCode: detail('accessCode'),
              intercom: detail('intercom'),
              floor: detail('floor'),
            }
          : {}),
        note: noteRef.current?.value.trim() || undefined,
      },
    };
  }, [mode, current]);

  const cartPayload = () =>
    Object.entries(cart).map(([id, qty]) => ({ id, qty }));

  const finishPhoneOrder = async () => {
    const cust = customerData();
    if (!cust.ok) {
      toast(cust.error);
      return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload(), mode, promoCode: appliedCode || undefined, customer: cust.value, locationId }),
      });
      const data = (await res.json()) as { num?: string; order?: Order; firebase?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error || 'Erreur');
      const num = data.num || 'MC';
      // Mode démo (pas de Firebase serveur) : on garde la commande en local
      // pour qu'elle apparaisse dans /admin → Commandes.
      if (!data.firebase && data.order) addDemoOrder(data.order);
      setOrderNum({ num, paid: false, total: data.order?.total });
      clear();
      formRef.current?.reset();
      setAppliedCode(null);
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      toast(`Commande ${num} enregistrée !`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setPaying(false);
    }
  };

  const payOnline = async () => {
    const cust = customerData();
    if (!cust.ok) {
      toast(cust.error);
      return;
    }
    if (deliveryBlocked) {
      toast(`Ajoutez encore ${fmt(lacks)} pour la livraison`);
      return;
    }
    setPaying(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload(), mode, promoCode: appliedCode || undefined, customer: cust.value, locationId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.status === 503 || data.error === 'stripe_not_configured') {
        toast('Paiement en ligne bientôt disponible — choisissez « Par téléphone » pour commander dès maintenant');
        setPayment('phone');
        return;
      }
      if (!res.ok || !data.url) throw new Error(data.error || 'Paiement indisponible');
      window.location.href = data.url; // → page Stripe Checkout sécurisée
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Paiement indisponible, réessayez');
    } finally {
      setPaying(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (count === 0 || paying) return;
    if (payment === 'card') payOnline();
    else finishPhoneOrder();
  };

  const showSuccess = orderNum !== null;
  const showEmpty = !showSuccess && count === 0;
  const showCheckout = !showSuccess && count > 0;

  return (
    <>
      <div className="section after-nav">
        <div className="container">
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
            <Link href="/la-carte" className="btn btn-solid">
              Voir la carte
            </Link>
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
                  setAppliedCode(null);
                  toast('Panier vidé');
                }}
              >
                <Icon name="trash" size={13} /> Vider le panier
              </button>
              <div id="cartItems">
                {Object.entries(cart).map(([id, q]) => {
                  const p = menu.products.find((x) => x.id === id);
                  if (!p) return null;
                  const lp = priceOf(id);
                  return (
                    <div className="cart-item" key={id}>
                      <span className="ci-thumb">
                        <SmartImg src={p.img} alt={p.name} loading="lazy" />
                      </span>
                      <div>
                        <p className="ci-name">{p.name}</p>
                        <p className="ci-unit">
                          {lp.oldPrice != null && <s className="p-old-price">{fmt(lp.oldPrice)} </s>}
                          {fmt(lp.price)} / unité
                        </p>
                        <div className="ci-controls">
                          <button
                            className="qty-btn"
                            onClick={() => setQty(id, -1)}
                            aria-label={`Retirer un ${p.name}`}
                          >
                            <Icon name="minus" size={13} strokeWidth={2.4} />
                          </button>
                          <span className="qty-value">{q}</span>
                          <button
                            className="qty-btn"
                            onClick={() => setQty(id, 1)}
                            aria-label={`Ajouter un ${p.name}`}
                          >
                            <Icon name="plus" size={13} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                      <div className="ci-side">
                        <span className="ci-price">{fmt(lp.price * q)}</span>
                        <button
                          className="ci-remove"
                          onClick={() => remove(id)}
                          aria-label={`Supprimer ${p.name}`}
                        >
                          <Icon name="close" size={15} strokeWidth={2.2} />
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
                {appliedCode && codeValid && discount > 0 && (
                  <div className="sum-row promo-row">
                    <span>Code {appliedCode}</span>
                    <span>−{fmt(discount)}</span>
                  </div>
                )}
                {mode === 'delivery' && (
                  <div className="sum-row" id="sumFeeRow">
                    <span>Frais de livraison</span>
                    <span id="sumFee">{fmt(fee)}</span>
                  </div>
                )}
                <div className="sum-row total">
                  <span>Total</span>
                  <span id="sumTotal">{fmt(discounted + fee)}</span>
                </div>

                {/* Code promo */}
                <div className="promo-code-row">
                  {appliedCode ? (
                    <div className="promo-applied">
                      <span>
                        <Icon name="check" size={13} strokeWidth={2.4} /> Code <b>{appliedCode}</b>
                        {!codeValid && ` — dès ${fmt(promo?.minTotal || 0)} d'achat`}
                      </span>
                      <button type="button" onClick={() => setAppliedCode(null)} aria-label="Retirer le code promo">
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        placeholder="CODE PROMO"
                        aria-label="Code promo"
                      />
                      <button type="button" className="btn btn-ghost" onClick={applyCode}>
                        Appliquer
                      </button>
                    </>
                  )}
                </div>

                {mode === 'delivery' && (
                  <div className="delivery-progress">
                    <div className="dp-head">
                      <span>
                        {deliveryBlocked
                          ? `Encore ${fmt(lacks)} pour la livraison`
                          : 'Objectif livraison atteint'}
                      </span>
                      <b>
                        {Math.min(Math.round((discounted / current.minDelivery) * 100), 100)}%
                      </b>
                    </div>
                    <div
                      className="dp-track"
                      role="progressbar"
                      aria-label={`Progression vers le minimum de ${fmt(current.minDelivery)} pour la livraison`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.min(Math.round((discounted / current.minDelivery) * 100), 100)}
                    >
                      <div
                        className={`dp-fill${deliveryBlocked ? '' : ' done'}`}
                        style={{ width: `${Math.min((discounted / current.minDelivery) * 100, 100)}%` }}
                      />
                    </div>
                    {!deliveryBlocked && (
                      <p className="dp-done">
                        <Icon name="check" size={13} strokeWidth={2.4} /> Livraison débloquée —
                        on arrive chez vous&nbsp;!
                      </p>
                    )}
                  </div>
                )}
                <p className={`sum-note${mode === 'delivery' && deliveryBlocked ? ' warn' : ''}`} id="sumNote">
                  {mode === 'delivery'
                    ? deliveryBlocked
                      ? `Livraison possible à partir de ${fmt(current.minDelivery)} d'achat.`
                      : <span className="note-ico"><Icon name="scooter" size={14} /> Livraison par My Chicken {current.city} — {current.postal} et alentour.</span>
                    : ''}
                </p>
              </div>

              <form className="order-form panel" ref={formRef} onSubmit={submit} style={{ padding: '1.9rem' }}>
                {closed && (
                  <p className="sum-note warn" style={{ marginBottom: '1rem' }}>
                    Le restaurant est actuellement fermé — vous pouvez préparer votre commande, elle sera envoyée à la réouverture.
                  </p>
                )}
                <div className="order-location">
                  <Icon name="pin" size={15} />
                  <span>
                    Commande préparée par <b>My Chicken {current.city}</b> — {current.address}
                  </span>
                  <button type="button" className="ol-change" onClick={openGate}>
                    Changer
                  </button>
                </div>
                <fieldset>
                  <legend>Mode</legend>
                  {MODES(current.minDelivery).map((m) => (
                    <label className="radio-opt" key={m.value}>
                      <input
                        type="radio"
                        name="mode"
                        value={m.value}
                        checked={mode === m.value}
                        onChange={() => setMode(m.value)}
                      />
                      <Icon name={m.icon} size={17} />
                      {m.label}
                    </label>
                  ))}
                </fieldset>

                <fieldset>
                  <legend>Paiement</legend>
                  {PAYMENTS.map((p) => (
                    <label className="radio-opt" key={p.value}>
                      <input
                        type="radio"
                        name="payment"
                        value={p.value}
                        checked={payment === p.value}
                        onChange={() => setPayment(p.value)}
                      />
                      <Icon name={p.value === 'card' ? 'lock' : 'phone'} size={17} />
                      <span>
                        {p.label}
                        <em className="pay-hint">{p.hint}</em>
                      </span>
                    </label>
                  ))}
                </fieldset>

                {mode === 'delivery' && (
                  <div className="f-group" id="deliveryFields">
                    <label htmlFor="dAddr">Adresse de livraison *</label>
                    <input
                      ref={addrRef}
                      id="dAddr"
                      type="text"
                      required
                      placeholder={`12 rue des Écoles, ${current.postal} ${current.city}`}
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="f-group">
                    <label htmlFor="dName">Nom et prénom *</label>
                    <input ref={nameRef} id="dName" type="text" required placeholder="Prénom Nom" />
                  </div>
                  <div className="f-group">
                    <label htmlFor="dPhone">Téléphone *</label>
                    <input ref={phoneRef} id="dPhone" type="tel" placeholder="06.. .. .. .." required />
                  </div>
                </div>

                {mode === 'delivery' && (
                  <fieldset className="dl-details">
                    <legend>Compléments d&apos;adresse <span className="opt">(facultatif)</span></legend>
                    <div className="form-row">
                      <div className="f-group">
                        <label htmlFor="dBuilding">N° de bâtiment</label>
                        <input
                          id="dBuilding"
                          type="text"
                          ref={(el) => { detailRefs.current.building = el; }}
                          placeholder="Bât. B"
                        />
                      </div>
                      <div className="f-group">
                        <label htmlFor="dDoor">N° de porte / appartement</label>
                        <input
                          id="dDoor"
                          type="text"
                          ref={(el) => { detailRefs.current.door = el; }}
                          placeholder="Appt 12"
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="f-group">
                        <label htmlFor="dAccess">Code d&apos;accès</label>
                        <input
                          id="dAccess"
                          type="text"
                          ref={(el) => { detailRefs.current.accessCode = el; }}
                          placeholder="Ex. 4512A"
                        />
                      </div>
                      <div className="f-group">
                        <label htmlFor="dIntercom">Interphone</label>
                        <input
                          id="dIntercom"
                          type="text"
                          ref={(el) => { detailRefs.current.intercom = el; }}
                          placeholder="Nom sur l'interphone"
                        />
                      </div>
                    </div>
                    <div className="f-group">
                      <label htmlFor="dFloor">Étage</label>
                      <input
                        id="dFloor"
                        type="text"
                        ref={(el) => { detailRefs.current.floor = el; }}
                        placeholder="Ex. 3e étage gauche"
                      />
                    </div>
                  </fieldset>
                )}
                <div className="f-group">
                  <label htmlFor="dNote">
                    Instructions pour le restaurant{' '}
                    <span style={{ textTransform: 'none', letterSpacing: 0 }}>(facultatif — ex. sans piment, bien cuit…)</span>
                  </label>
                  <textarea
                    ref={noteRef}
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
                  disabled={deliveryBlocked || paying}
                  style={
                    deliveryBlocked || paying
                      ? { opacity: 0.5, cursor: 'not-allowed' }
                      : { opacity: 1, cursor: 'pointer' }
                  }
                >
                  {paying
                    ? 'Un instant…'
                    : payment === 'card'
                      ? 'Payer par carte'
                      : 'Confirmer la commande'}
                </button>
                <p className="secure-note">
                  <Icon name="lock" size={13} />{' '}
                  {payment === 'card'
                    ? 'Paiement sécurisé par Stripe — cb, Visa, Mastercard'
                    : 'Commande confirmée par téléphone avant préparation'}
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
              {orderNum.num}
            </span>
            {orderNum.paid ? (
              <p className="paid-badge">
                <Icon name="check" size={14} strokeWidth={2.6} /> Paiement de
                {orderNum.total != null ? ` ${fmt(orderNum.total)}` : ''} confirmé — c'est noté&nbsp;!
              </p>
            ) : (
              <p>Votre commande est enregistrée. Nous vous appelons très vite pour la confirmer.</p>
            )}
            <p>Gardez votre téléphone à portée de main — à tout de suite&nbsp;!</p>
            <div className="os-actions">
              <Link href="/" className="btn btn-ghost">
                Retour à l&apos;accueil
              </Link>
              <Link href="/la-carte" className="btn btn-solid">
                Voir la carte
              </Link>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
