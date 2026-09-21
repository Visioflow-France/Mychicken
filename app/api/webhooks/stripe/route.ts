import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { ORDERS_COLLECTION } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

/* ================================================================
   Webhook Stripe — confirme les paiements.
   À brancher dans le dashboard Stripe → Webhooks → endpoint :
     https://votre-domaine.fr/api/webhooks/stripe
   Événement : checkout.session.completed
   Secret : STRIPE_WEBHOOK_SECRET (whsec_…)
   ================================================================ */

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;

  let event: { type: string; data: { object: Record<string, unknown> } };

  if (secret && key) {
    try {
      const { default: Stripe } = await import('stripe');
      const stripe = new Stripe(key);
      event = stripe.webhooks.constructEvent(payload, signature!, secret) as unknown as typeof event;
    } catch (e) {
      console.error('[stripe-webhook] signature invalide :', e);
      return NextResponse.json({ error: 'Signature invalide' }, { status: 400 });
    }
  } else {
    // Sans secret configuré (ex. local) : on accepte le corps tel quel
    try {
      event = JSON.parse(payload);
    } catch {
      return NextResponse.json({ error: 'Payload invalide' }, { status: 400 });
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { payment_status?: string; metadata?: Record<string, string> };
    const num = session.metadata?.num;
    if (num && session.payment_status === 'paid') {
      const db = await getAdminDb();
      if (db) {
        try {
          await db.collection(ORDERS_COLLECTION).doc(num).update({ paid: true, status: 'nouvelle' });
        } catch (e) {
          console.error('[stripe-webhook] mise à jour commande impossible :', e);
        }
      }
      console.log(`[stripe-webhook] commande ${num} payée ✓`);
    }
  }

  return NextResponse.json({ received: true });
}
