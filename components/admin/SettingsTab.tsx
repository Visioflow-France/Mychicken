'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useMenu } from '@/lib/menu-store';
import type { MenuData } from '@/lib/data';

type Mutate = (fn: (d: MenuData) => MenuData) => void;

type SysConfig = {
  stripe: boolean;
  stripeMode: 'test' | 'live' | null;
  connect: boolean;
  feePercent: number;
  firebaseWrite: boolean;
};

/* État du compte Stripe Connect de My Chicken (/api/stripe/account).
   UN compte unique : Persan et Saint-Mard ont le même compte bancaire. */
type LocAccount = {
  connected: boolean;
  source?: 'dashboard' | 'env';
  accountId?: string;
  businessName?: string | null;
  detailsSubmitted?: boolean;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
};

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
  const [locAcct, setLocAcct] = useState<LocAccount | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then(setSys)
      .catch(() => setSys(null));
  }, []);

  useEffect(() => {
    if (!sys?.stripe) return;
    setLocAcct(null);
    fetch('/api/stripe/account')
      .then((r) => r.json())
      .then(setLocAcct)
      .catch(() => setLocAcct(null));
  }, [sys?.stripe]);

  /* Bouton « Connecter Stripe » : crée le compte My Chicken (1er clic)
     et envoie sur la page d'inscription hébergée par Stripe (identité
     + RIB à remplir par le gérant — conforme à la réglementation FR). */
  const connectStripe = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/stripe/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: 'My Chicken' }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      alert(json.error || 'Impossible de créer le lien Stripe.');
    } catch {
      alert('Connexion au serveur impossible.');
    }
    setConnecting(false);
  };

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
          <Icon name="tag" size={16} /> Paiement en ligne — Stripe
        </h3>

        {sys === null ? (
          <p className="ap-help">Vérification de la connexion Stripe…</p>
        ) : sys.stripe ? (
          <div className="stripe-ok">
            <p className="sys-badge ok">
              <Icon name="check" size={14} /> Stripe connecté — mode {sys.stripeMode === 'live' ? 'PRODUCTION' : 'TEST'}
            </p>

            {/* Compte unique My Chicken (Persan + Saint-Mard) : bouton + état en direct */}
            <div className="stripe-loc">
              <h4>Compte du restaurant — Persan &amp; Saint-Mard</h4>
              {locAcct === null ? (
                <p className="ap-help">Vérification du compte My Chicken…</p>
              ) : !locAcct.connected ? (
                <>
                  <p className="ap-help">
                    Aucun compte Stripe n&apos;est encore relié : pour l&apos;instant, les paiements des deux restaurants
                    arrivent sur le compte du site. Reliez le compte My Chicken en 15 minutes — identité et RIB
                    renseignés par le gérant sur la page Stripe. Un seul compte suffit (même compte bancaire).
                  </p>
                  <button className="btn" onClick={connectStripe} disabled={connecting}>
                    {connecting ? 'Création du lien…' : 'Connecter le compte Stripe My Chicken'}
                  </button>
                </>
              ) : locAcct.chargesEnabled && locAcct.payoutsEnabled ? (
                <>
                  <p className="loc-status ok">
                    <Icon name="check" size={14} /> Compte actif ({locAcct.accountId}
                    {locAcct.businessName ? ` — ${locAcct.businessName}` : ''}) : les paiements Persan et Saint-Mard
                    vont directement au restaurant.
                  </p>
                  {locAcct.source === 'dashboard' && (
                    <button className="btn btn-ghost" onClick={connectStripe} disabled={connecting}>
                      {connecting ? 'Création du lien…' : 'Mettre à jour les informations'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="loc-status pending">
                    Inscription en cours ({locAcct.accountId}) — le gérant doit la compléter (identité + RIB) pour que
                    les paiements arrivent au restaurant.
                  </p>
                  <button className="btn" onClick={connectStripe} disabled={connecting}>
                    {connecting ? 'Création du lien…' : 'Reprendre l\u2019inscription'}
                  </button>
                </>
              )}
            </div>

            <ul className="sys-list">
              <li className={sys.connect ? 'ok' : ''}>
                <b>Compte</b>
                {sys.connect
                  ? 'Stripe Connect — chaque restaurant encaisse directement sur son propre compte.'
                  : 'Compte standard — les paiements arrivent sur le compte Stripe relié au site.'}
              </li>
              <li className={sys.connect ? 'ok' : ''}>
                <b>Commission plateforme</b>
                {sys.connect
                  ? sys.feePercent > 0
                    ? `${sys.feePercent} % par commande, tout compris — frais Stripe à notre charge, la part du restaurant est nette.`
                    : '0 % — aucun prélèvement.'
                  : '0 % — aucune commission en mode standard : le restaurant ne paye que les frais Stripe de son propre compte.'}
              </li>
              {sys.stripeMode === 'test' && (
                <li>
                  <b>Mode test</b>
                  Les paiements sont simulés (carte 4242 4242 4242 4242). Passe les clés en production (sk_live…) pour
                  encaisser réellement.
                </li>
              )}
            </ul>
            <a href="https://dashboard.stripe.com" target="_blank" rel="noreferrer" className="btn btn-ghost">
              Ouvrir le tableau de bord Stripe <Icon name="arrowRight" size={14} />
            </a>
          </div>
        ) : (
          <div className="stripe-setup">
            <p className="ap-help">
              Le paiement en ligne n&apos;est pas encore activé — les clients peuvent déjà commander par téléphone.
              Pour l&apos;activer, il faut une clé secrète Stripe (gratuit, ~15 min) :
            </p>
            <ol className="stripe-steps">
              <li>
                Créer un compte sur <b>stripe.com</b> (c&apos;est la plateforme qui encaisse, le restaurant reliera
                ensuite son propre compte).
              </li>
              <li>
                Récupérer la <b>clé secrète</b> (Dashboard Stripe → Développeurs → Clés API → sk_test… puis sk_live… en
                production) et l&apos;enregistrer dans le serveur sous <code>STRIPE_SECRET_KEY</code>, puis redéployer.
              </li>
              <li>
                Revenir ici : le bouton <b>« Connecter le compte Stripe »</b> permettra au gérant de relier son compte
                (identité + RIB) et de recevoir les paiements directement.
              </li>
            </ol>
            <a href="https://stripe.com/fr" target="_blank" rel="noreferrer" className="btn btn-ghost">
              Créer un compte Stripe <Icon name="arrowRight" size={14} />
            </a>
          </div>
        )}
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
