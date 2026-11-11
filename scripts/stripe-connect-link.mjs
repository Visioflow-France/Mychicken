/*
 * Génère l'inscription Stripe Connect (Standard) d'un restaurant :
 *   node scripts/stripe-connect-link.mjs "Persan"
 *   → crée le compte connecté (acct_…)
 *   → affiche le LIEN D'INSCRIPTION hébergé par Stripe à envoyer au resto
 *     (conforme à la réglementation FR : le resto saisit lui-même ses infos).
 *
 *   node scripts/stripe-connect-link.mjs --link acct_XXXX
 *   → PAS de création : régénère juste un lien d'inscription frais
 *     pour un compte EXISTANT (utile si la création est bloquée,
 *     ou si l'ancien lien a expiré / a été perdu).
 *
 * Prérequis : STRIPE_SECRET_KEY dans l'environnement ou .env.local.
 * Noter l'acct_… affiché → secret STRIPE_CONNECT_ACCOUNT_ID.
 */
import Stripe from 'stripe';
import { readFileSync } from 'node:fs';

/* Charge .env.local s'il existe (la clé peut y être au lieu de l'environnement). */
try {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error('STRIPE_SECRET_KEY introuvable (ni environnement ni .env.local).');
  process.exit(1);
}

const stripe = new Stripe(key);
const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://my-chicken.claytonmicello2009.workers.dev';

/* Compte déjà créé : on régénère juste un lien d'inscription. */
if (process.argv[2] === '--link') {
  const account = process.argv[3];
  if (!account || !account.startsWith('acct_')) {
    console.error('Usage : node scripts/stripe-connect-link.mjs --link acct_XXXX');
    process.exit(1);
  }
  const link = await stripe.accountLinks.create({
    account,
    refresh_url: `${site}/admin`,
    return_url: `${site}/admin`,
    type: 'account_onboarding',
  });
  console.log(`\nCompte : ${account}`);
  console.log(`\n→ Envoyer ce lien au restaurant (valide une seule fois, 7 jours) :`);
  console.log(`  ${link.url}\n`);
  process.exit(0);
}

const name = process.argv[2];
if (!name) {
  console.error('Usage : node scripts/stripe-connect-link.mjs "Nom du restaurant"  |  --link acct_XXXX');
  process.exit(1);
}

const account = await stripe.accounts.create({
  type: 'standard',
  country: 'FR',
  business_profile: { name },
});

const link = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${site}/admin`,
  return_url: `${site}/admin`,
  type: 'account_onboarding',
});

console.log(`\nRestaurant : ${name}`);
console.log(`ID du compte (à conserver) : ${account.id}`);
console.log(`\n→ Envoyer ce lien au restaurant (valide une seule fois, 7 jours) :`);
console.log(`  ${link.url}\n`);
console.log(`Puis : npx wrangler secret put STRIPE_CONNECT_${name.toUpperCase().includes('PERSAN') ? 'PERSAN' : 'SAINT_MARD'}_ACCT  (valeur : ${account.id})`);
