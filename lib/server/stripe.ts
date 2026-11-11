/* ================================================================
   Stripe côté serveur — helpers partagés entre les routes API.

   Compte connecté UNIQUE pour My Chicken (Persan et Saint-Mard ont
   le même compte bancaire → un seul compte Stripe Connect) : les
   paiements des DEUX restaurants partent directement dessus.
   Deux sources, par ordre de priorité :
   1. Firestore `stripe/connect` — rempli par le bouton
      « Connecter Stripe » du dashboard (self-service) ;
   2. Variables d'environnement (STRIPE_CONNECT_ACCOUNT_ID, ou
      STRIPE_CONNECT_PERSAN_ACCT / STRIPE_CONNECT_SAINT_MARD_ACCT).
   ================================================================ */

import { getAdminDb } from './firebase-admin';

export const CONNECT_DOC = 'stripe/connect';

export async function getStripe(): Promise<import('stripe').default | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const { default: Stripe } = await import('stripe');
  return new Stripe(key);
}

export type ConnectInfo = { accountId: string; source: 'dashboard' | 'env' } | null;

/** Compte Connect de My Chicken (dashboard d'abord, env ensuite). */
export async function getConnectAccount(locationId?: string): Promise<ConnectInfo> {
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.doc(CONNECT_DOC).get();
      const acct = String(snap.data()?.accountId || '').trim();
      if (acct.startsWith('acct_')) return { accountId: acct, source: 'dashboard' };
    } catch (e) {
      console.error('[stripe] lecture du compte connecté impossible :', e);
    }
  }
  /* Variables d'environnement : deux familles acceptées —
     STRIPE_CONNECT_ACCOUNT_PERSAN/SAINT_MARD (scripts npm stripe:connect)
     ou STRIPE_CONNECT_PERSAN_ACCT/SAINT_MARD_ACCT — puis le compte commun. */
  const envFor = (locationId?: string) => {
    const names =
      locationId === 'saint-mard'
        ? ['STRIPE_CONNECT_ACCOUNT_SAINT_MARD', 'STRIPE_CONNECT_SAINT_MARD_ACCT']
        : locationId === 'persan'
          ? ['STRIPE_CONNECT_ACCOUNT_PERSAN', 'STRIPE_CONNECT_PERSAN_ACCT']
          : [];
    const perLocation = names.map((n) => process.env[n]).find((v) => v && v.trim().startsWith('acct_'));
    return perLocation || process.env.STRIPE_CONNECT_ACCOUNT_ID;
  };
  const acct = (envFor(locationId) || '').trim();
  return acct.startsWith('acct_') ? { accountId: acct, source: 'env' } : null;
}

/** Enregistre le compte connecté unique (bouton du dashboard). */
export async function setConnectAccount(accountId: string): Promise<boolean> {
  const db = await getAdminDb();
  if (!db) return false;
  await db.doc(CONNECT_DOC).set({ accountId, updatedAt: Date.now() });
  return true;
}
