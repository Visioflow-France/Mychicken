/* ================================================================
   Stripe Connect Standard — onboarding des deux restaurants.

   Ton compte Stripe = la plateforme. Chaque restaurant obtient SON
   propre compte Stripe (Connect Standard) rattaché à la plateforme :
   les paiements sont encaissés directement sur le compte du resto,
   qui reçoit lui-même ses virements bancaires.

   Utilisation (la clé est lue dans .env.local → STRIPE_SECRET_KEY) :

     npm run stripe:connect -- create persan  [email-du-patron]
     npm run stripe:connect -- create saint-mard [email-du-patron]
        → crée le compte connecté et affiche le LIEN D'ONBOARDING
          à ouvrir avec le patron (il crée/relie son compte Stripe,
          remplit SIRET, IBAN, identité du dirigeant…)

     npm run stripe:connect -- link acct_123…
        → régénère un lien d'onboarding (si expiré)

     npm run stripe:connect -- status [acct_123…]
        → état du compte : charges/payouts activés, infos manquantes
          (sans argument : tous les comptes configurés dans .env.local)

   À la fin de l'onboarding, reporter le acct_… dans .env.local :
     STRIPE_CONNECT_ACCOUNT_PERSAN=acct_…
     STRIPE_CONNECT_ACCOUNT_SAINT_MARD=acct_…
   ================================================================ */

import fs from 'node:fs';
import Stripe from 'stripe';

/* ---------- Clé Stripe depuis .env.local (ou l'environnement) ---------- */
function envValue(name) {
  if (process.env[name]) return process.env[name];
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const m = env.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^"(.*)"$/s, '$1') : null;
  } catch {
    return null;
  }
}

const key = envValue('STRIPE_SECRET_KEY');
if (!key) {
  console.error('✖ STRIPE_SECRET_KEY introuvable (ni environnement ni .env.local).');
  process.exit(1);
}
const stripe = new Stripe(key);

const siteUrl = (envValue('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000').replace(/\/$/, '');
const [cmd, ...args] = process.argv.slice(2);

const NAMES = { persan: 'My Chicken Persan', 'saint-mard': 'My Chicken Saint-Mard' };

function usage() {
  console.log(`Usage :
  npm run stripe:connect -- create <persan|saint-mard> [email]
  npm run stripe:connect -- link <acct_…>
  npm run stripe:connect -- status [acct_…]`);
}

async function onboardingLink(accountId) {
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${siteUrl}/admin`,
    return_url: `${siteUrl}/admin`,
    type: 'account_onboarding',
  });
  return link.url;
}

function printStatus(a) {
  console.log(`  Compte      : ${a.id}`);
  console.log(`  Restaurant  : ${a.business_profile?.name || a.email || '(à compléter pendant l\'onboarding)'}`);
  console.log(`  Paiements   : ${a.charges_enabled ? '✓ activés' : '✖ pas encore'}`);
  console.log(`  Virements   : ${a.payouts_enabled ? '✓ activés' : '✖ pas encore'}`);
  const missing = a.requirements?.currently_due || [];
  if (!a.payouts_enabled) {
    console.log(`  → Ouvre l'onboarding pour finaliser : ${missing.length ? missing.join(', ') : 'validation Stripe en cours'}`);
  }
}

try {
  if (cmd === 'create') {
    const loc = args[0];
    const email = args[1];
    if (!NAMES[loc]) {
      console.error('✖ Restaurant inconnu — choisir "persan" ou "saint-mard".');
      usage();
      process.exit(1);
    }
    const account = await stripe.accounts.create({
      type: 'standard', // le patron garde le contrôle total de SON compte Stripe
      country: 'FR',
      ...(email ? { email } : {}),
    });
    console.log(`✓ Compte connecté créé pour ${NAMES[loc]} : ${account.id}\n`);
    console.log('1. Ouvre ce lien avec le patron (valable une fois, une heure) :');
    console.log(`\n   ${await onboardingLink(account.id)}\n`);
    console.log(`2. Le patron se connecte / crée son compte Stripe et complète ses infos (SIRET, IBAN…).`);
    console.log(`3. Une fois terminé, ajoute dans .env.local puis redéploie :`);
    console.log(`     STRIPE_CONNECT_ACCOUNT_${loc === 'persan' ? 'PERSAN' : 'SAINT_MARD'}=${account.id}`);
    console.log(`\nVérifier plus tard : npm run stripe:connect -- status ${account.id}`);
  } else if (cmd === 'link') {
    const acct = args[0];
    if (!acct?.startsWith('acct_')) {
      console.error('✖ Indique le compte : npm run stripe:connect -- link acct_…');
      process.exit(1);
    }
    console.log(`Lien d'onboarding (ou de mise à jour) pour ${acct} :\n\n   ${await onboardingLink(acct)}\n`);
  } else if (cmd === 'status') {
    const acct = args[0];
    if (acct) {
      printStatus(await stripe.accounts.retrieve(acct));
    } else {
      const configured = [
        ['Persan', envValue('STRIPE_CONNECT_ACCOUNT_PERSAN')],
        ['Saint-Mard', envValue('STRIPE_CONNECT_ACCOUNT_SAINT_MARD')],
      ].filter(([, id]) => id);
      if (!configured.length) {
        console.log('Aucun compte connecté dans .env.local — lance d\'abord « create ».');
        const list = await stripe.accounts.list({ limit: 10 });
        if (list.data.length) {
          console.log('\nComptes existants sur la plateforme :');
          for (const a of list.data) printStatus(a);
        }
      } else {
        for (const [name, id] of configured) {
          console.log(`— ${name}`);
          printStatus(await stripe.accounts.retrieve(id));
          console.log('');
        }
      }
    }
  } else {
    usage();
  }
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`✖ Stripe : ${msg.includes('api key') ? 'clé invalide (STRIPE_SECRET_KEY)' : msg}`);
  process.exit(1);
}
