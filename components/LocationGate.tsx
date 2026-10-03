'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useLocationCtx } from '@/lib/location-store';
import type { RestaurantLocation } from '@/lib/data';

/* ================================================================
   Popup d'entrée — « Dans quel restaurant commandez-vous ? »
   • À emporter / sur place : choix direct Saint-Mard ou Persan.
   • Livraison : code postal → restaurant qui livre cette zone
     (le plus proche), sinon refus explicite.
   ================================================================ */

type GateTab = 'pickup' | 'delivery';

export default function LocationGate() {
  const { gateOpen, closeGate, choose, locations, findByPostal } = useLocationCtx();
  const [tab, setTab] = useState<GateTab>('pickup');
  const [cp, setCp] = useState('');
  const [result, setResult] = useState<{ ok: boolean; loc?: RestaurantLocation } | null>(null);

  useEffect(() => {
    if (gateOpen) {
      setCp('');
      setResult(null);
    }
  }, [gateOpen]);

  /* Bloque le scroll quand la popup est ouverte */
  useEffect(() => {
    document.body.style.overflow = gateOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [gateOpen]);

  if (!gateOpen) return null;

  const checkPostal = () => {
    const loc = findByPostal(cp);
    setResult({ ok: Boolean(loc), loc: loc || undefined });
  };

  return (
    <div className="lg-overlay" role="dialog" aria-modal="true" aria-label="Choisir votre restaurant">
      <div className="lg-card">
        <span className="lg-badge" aria-hidden="true">
          <Icon name="pin" size={18} />
        </span>
        <h2>Bienvenue chez My Chicken&nbsp;!</h2>
        <p className="lg-sub">Deux restaurants, la même gourmandise. Où commandez-vous&nbsp;?</p>

        {/* Bascule à emporter / livraison */}
        <div className="lg-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'pickup'}
            className={`lg-tab${tab === 'pickup' ? ' active' : ''}`}
            onClick={() => setTab('pickup')}
          >
            <Icon name="bag" size={15} /> À emporter / sur place
          </button>
          <button
            role="tab"
            aria-selected={tab === 'delivery'}
            className={`lg-tab${tab === 'delivery' ? ' active' : ''}`}
            onClick={() => setTab('delivery')}
          >
            <Icon name="scooter" size={15} /> Livraison
          </button>
        </div>

        {tab === 'pickup' ? (
          <div className="lg-choices">
            {locations.map((l) => (
              <button key={l.id} className="lg-choice" onClick={() => choose(l.id)}>
                <span className="lg-city">{l.city}</span>
                <span className="lg-addr">
                  {l.address}, {l.postal} {l.city}
                </span>
                <span className="lg-hours">{l.hours}</span>
                <span className="lg-go">
                  Commander ici <Icon name="arrowRight" size={14} strokeWidth={2.2} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="lg-delivery">
            <label htmlFor="lgCp" className="lg-label">
              Votre code postal
            </label>
            <div className="lg-cp-row">
              <input
                id="lgCp"
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={cp}
                onChange={(e) => {
                  setCp(e.target.value.replace(/\D/g, ''));
                  setResult(null);
                }}
                placeholder="95340"
              />
              <button className="btn btn-solid" onClick={checkPostal} disabled={cp.length !== 5}>
                Vérifier
              </button>
            </div>

            {result?.ok && result.loc && (
              <div className="lg-result ok">
                <Icon name="check" size={15} strokeWidth={2.4} />
                <div>
                  <b>Bonne nouvelle — on vous livre&nbsp;!</b>
                  <p>
                    Livraison assurée par <b>My Chicken {result.loc.city}</b> ({result.loc.address})
                    dès {result.loc.minDelivery}&nbsp;€ d&apos;achat.
                  </p>
                  <button className="btn btn-solid lg-continue" onClick={() => choose(result.loc!.id)}>
                    Continuer chez {result.loc.city} <Icon name="arrowRight" size={14} strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            )}

            {result && !result.ok && (
              <div className="lg-result ko">
                <Icon name="close" size={15} strokeWidth={2.4} />
                <div>
                  <b>Dommage — ce code postal n&apos;est pas encore livré.</b>
                  <p>
                    Vous pouvez commander à emporter dans l&apos;un de nos restaurants, ou nous
                    appeler pour en savoir plus.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="lg-skip" onClick={closeGate}>
          Continuer sans choisir
        </button>
      </div>
    </div>
  );
}
