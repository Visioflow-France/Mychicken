import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getStripe, getConnectAccount } from '@/lib/server/stripe';

export const dynamic = 'force-dynamic';

/* État du compte Stripe Connect de My Chicken (compte unique pour
   Persan + Saint-Mard), affiché dans Réglages : inscription
   complétée ? encaissements activés ? versements activés ? */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const connect = await getConnectAccount();
  if (!connect) return NextResponse.json({ connected: false });

  const stripe = await getStripe();
  if (!stripe) return NextResponse.json({ error: 'STRIPE_SECRET_KEY manquante' }, { status: 503 });

  try {
    const acct = await stripe.accounts.retrieve(connect.accountId);
    return NextResponse.json({
      connected: true,
      source: connect.source,
      accountId: acct.id.slice(0, 14) + '…',
      businessName: acct.business_profile?.name || null,
      detailsSubmitted: acct.details_submitted,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
    });
  } catch (e) {
    console.error('[stripe/account] :', e);
    return NextResponse.json({ connected: true, source: connect.source, accountId: connect.accountId.slice(0, 14) + '…', error: 'État indisponible' });
  }
}
