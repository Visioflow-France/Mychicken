import { NextResponse } from 'next/server';
import { getConnectAccount } from '@/lib/server/stripe';

export const dynamic = 'force-dynamic';

/* Petits indicateurs publics (aucun secret) pour afficher l'état
   du système dans /admin : quoi est configuré, quoi manque.
   Les comptes connectés viennent du bouton « Connecter Stripe »
   du dashboard (Firestore) OU des variables d'environnement. */
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY;
  const [persan, saintMard] = await Promise.all([getConnectAccount('persan'), getConnectAccount('saint-mard')]);
  const connect = Boolean(persan || saintMard);
  const mask = (c: typeof persan) => (c ? c.accountId.slice(0, 8) + '…' : null);
  return NextResponse.json({
    stripe: Boolean(key),
    stripeMode: key ? (key.startsWith('sk_test') ? 'test' : 'live') : null,
    connect,
    feePercent: connect ? Number(process.env.STRIPE_FEE_PERCENT || 0) : 0,
    connectPersan: mask(persan),
    connectSaintMard: mask(saintMard),
    firebaseWrite: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT ||
        (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
    ),
  });
}
