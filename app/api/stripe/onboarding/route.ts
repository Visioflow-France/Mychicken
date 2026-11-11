import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getStripe, getConnectAccount, setConnectAccount } from '@/lib/server/stripe';

export const dynamic = 'force-dynamic';

/* ================================================================
   Self-service Stripe Connect (comme Thaifood) — appelé par le
   bouton « Connecter Stripe » de l'onglet Réglages.
   UN SEUL compte pour tout My Chicken (Persan + Saint-Mard, même
   compte bancaire) :
   1. Compte déjà enregistré → on le réutilise
   2. Sinon → création d'un compte VIDE (aucune info bancaire :
      conforme à la réglementation FR, le gérant les saisira
      lui-même sur les pages hébergées par Stripe)
   3. Dans tous les cas → génération d'un lien d'inscription
      hébergé par Stripe (7 jours) où le gérant complète
      identité + RIB.
   ================================================================ */

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { name?: string } | null;

  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY manquante sur le serveur' }, { status: 503 });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  try {
    const existing = await getConnectAccount();
    let accountId: string;

    if (existing?.source === 'dashboard') {
      // Compte déjà créé par ce bouton : on régénère juste un lien
      // (inscription interrompue, lien expiré, mise à jour des infos).
      accountId = existing.accountId;
    } else {
      // Premier clic : création du compte vide, puis enregistrement.
      const account = await stripe.accounts.create({
        type: 'standard',
        country: 'FR',
        business_profile: { name: body?.name || 'My Chicken' },
      });
      accountId = account.id;
      const saved = await setConnectAccount(accountId);
      if (!saved) {
        // Compte créé mais Firestore indisponible : on rend le lien quand
        // même — le compte ne sera relié qu'une fois Firestore OK.
        console.error('[stripe/onboarding] Firestore indisponible, compte non enregistré :', accountId);
      }
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/admin`,
      return_url: `${origin}/admin`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: link.url, accountId });
  } catch (e) {
    console.error('[stripe/onboarding] :', e);
    return NextResponse.json(
      { error: e instanceof Error && e.message.includes('api key') ? 'Clé Stripe invalide (STRIPE_SECRET_KEY)' : 'Impossible de créer le lien Stripe — réessayez.' },
      { status: 502 }
    );
  }
}
