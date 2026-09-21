'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useMenu } from '@/lib/menu-store';
import type { MenuData } from '@/lib/data';

type Mutate = (fn: (d: MenuData) => MenuData) => void;

type SysConfig = { stripe: boolean; connect: boolean; firebaseWrite: boolean };

export default function SettingsTab({
  draft,
  mutate,
  onReset,
}: {
  draft: MenuData;
  mutate: Mutate;
  onReset: () => void;
}) {
  const { source } = useMenu();
  const [sys, setSys] = useState<SysConfig | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setSys)
      .catch(() => setSys(null));
  }, []);

  const num = (v: string) => Math.round(Number(v.replace(',', '.')) * 100) / 100;

  return (
    <div className="admin-stack">
      <section className="admin-panel">
        <h3 className="ap-title">
          <Icon name="clock" size={16} /> Commandes
        </h3>
        <label className="switch big">
          <input
            type="checkbox"
            checked={draft.config.open}
            onChange={(e) => mutate((d) => ({ ...d, config: { ...d.config, open: e.target.checked } }))}
          />
          <span />
          {draft.config.open ? 'Restaurant OUVERT aux commandes' : 'Restaurant FERMÉ aux commandes'}
        </label>

        <div className="form-grid">
          <div className="f-group">
            <label>Frais de livraison (€)</label>
            <input
              type="number"
              step="0.10"
              min="0"
              value={draft.config.deliveryFee}
              onChange={(e) => mutate((d) => ({ ...d, config: { ...d.config, deliveryFee: num(e.target.value) } }))}
            />
          </div>
          <div className="f-group">
            <label>Livraison à partir de (€)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={draft.config.minDelivery}
              onChange={(e) => mutate((d) => ({ ...d, config: { ...d.config, minDelivery: num(e.target.value) } }))}
            />
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <h3 className="ap-title">
          <Icon name="flame" size={16} /> État du système
        </h3>
        <ul className="sys-list">
          <li className={source === 'firebase' ? 'ok' : ''}>
            <b>Carte temps réel</b>
            {source === 'firebase'
              ? 'Firebase connecté — les modifications sont visibles par tous les visiteurs instantanément.'
              : 'Mode démo — les modifications ne sont visibles que dans ce navigateur. Ajoutez la configuration Firebase (voir README) pour passer en temps réel global.'}
          </li>
          <li className={sys?.stripe ? 'ok' : ''}>
            <b>Paiement en ligne</b>
            {sys?.stripe
              ? `Stripe actif${sys.connect ? ' — encaissement direct sur le compte du restaurant (Connect)' : ''}.`
              : 'En attente des clés Stripe (STRIPE_SECRET_KEY). Les clients peuvent déjà commander par téléphone.'}
          </li>
          <li className={sys?.firebaseWrite ? 'ok' : ''}>
            <b>Enregistrement des commandes</b>
            {sys?.firebaseWrite
              ? 'Commandes enregistrées dans Firestore.'
              : 'Les commandes seront enregistrées dès que la clé de service Firebase (FIREBASE_SERVICE_ACCOUNT) sera configurée.'}
          </li>
        </ul>
      </section>

      <section className="admin-panel danger-zone">
        <h3 className="ap-title">
          <Icon name="trash" size={16} /> Zone sensible
        </h3>
        <p className="ap-help">Remet produits, catégories, promos et réglages aux valeurs d&apos;origine du flyer.</p>
        <button className="btn btn-ghost" onClick={onReset}>
          Réinitialiser toute la carte
        </button>
      </section>
    </div>
  );
}
