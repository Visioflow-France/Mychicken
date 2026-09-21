import { NextResponse } from 'next/server';
import { getAdminDb, getServerMenu } from '@/lib/server/firebase-admin';
import { ORDERS_COLLECTION } from '@/lib/firebase';
import { clamp, promoPrice, round2, type Order, type OrderItem, type OrderMode } from '@/lib/data';

export const dynamic = 'force-dynamic';

/* ================================================================
   PAIEMENT — création d'une session Stripe Checkout.
   Prêt pour Stripe Connect : dès que STRIPE_CONNECT_ACCOUNT_ID
   (acct_…) est défini, l'encaissement part directement sur le
   compte du restaurant.
   Les prix sont TOUJOURS recalculés côté serveur depuis la carte
   (Firestore ou valeurs par défaut) — jamais depuis le client.
   ================================================================ */

type CheckoutBody = {
  items: { id: string; qty: number }[];
  mode: OrderMode;
  promoCode?: string;
  customer: { name?: string; phone: string; address?: string; note?: string };
};

function originOf(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    req.headers.get('origin') ||
    new URL(req.url).origin
  );
}

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const { default: Stripe } = await import('stripe');
  return new Stripe(key);
}

function stripeAccount(): string | undefined {
  const acct = process.env.STRIPE_CONNECT_ACCOUNT_ID;
  return acct && acct.startsWith('acct_') ? acct : undefined;
}

const euro = (n: number) => Math.round(n * 100); // € → centimes

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CheckoutBody | null;
  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Panier vide ou invalide' }, { status: 400 });
  }
  const phone = (body.customer?.phone || '').trim();
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 });
  }
  const mode: OrderMode = ['takeaway', 'dinein', 'delivery'].includes(body.mode) ? body.mode : 'takeaway';
  if (mode === 'delivery' && (body.customer?.address || '').trim().length < 8) {
    return NextResponse.json({ error: 'Adresse de livraison manquante' }, { status: 400 });
  }

  const stripe = await getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  /* ---- 1. Panier recalculé côté serveur ---- */
  const menu = await getServerMenu();
  if (!menu.config.open) {
    return NextResponse.json({ error: 'Le restaurant est fermé pour le moment' }, { status: 403 });
  }

  const items: OrderItem[] = [];
  for (const line of body.items) {
    const p = menu.products.find((x) => x.id === line.id);
    if (!p || p.available === false) continue;
    const qty = clamp(Math.floor(line.qty || 0), 0, 50);
    if (qty > 0) items.push({ id: p.id, name: p.name, price: promoPrice(p.price, menu.promos[p.id]), qty });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'Aucun article disponible dans le panier' }, { status: 400 });
  }

  const subtotal = round2(items.reduce((s, it) => s + it.price * it.qty, 0));
  const fee = mode === 'delivery' ? menu.config.deliveryFee : 0;
  if (mode === 'delivery' && subtotal < menu.config.minDelivery) {
    return NextResponse.json({ error: `Livraison possible dès ${menu.config.minDelivery} € d'achat` }, { status: 400 });
  }

  /* ---- 2. Code promo (validé côté serveur) ---- */
  let discount = 0;
  let appliedCode: string | undefined;
  const wanted = (body.promoCode || '').trim().toUpperCase();
  if (wanted) {
    const code = menu.promoCodes.find((c) => c.active && c.code === wanted);
    if (code && subtotal >= (code.minTotal || 0)) {
      discount =
        code.type === 'percent'
          ? round2(subtotal * clamp(code.value, 0, 100) / 100)
          : round2(Math.min(code.value, subtotal));
      appliedCode = code.code;
    }
  }

  const total = round2(Math.max(0.5, subtotal - discount + fee)); // Stripe : minimum 0,50 €
  const num = 'MC-' + Date.now().toString(36).toUpperCase().slice(-6);

  /* ---- 3. Session Stripe Checkout ---- */
  const origin = originOf(req);
  const lineItems: Record<string, unknown>[] = items.map((it) => ({
    quantity: it.qty,
    price_data: {
      currency: 'eur',
      unit_amount: euro(it.price),
      product_data: {
        name: it.name,
        ...( /^https?:\/\//.test(menu.products.find((p) => p.id === it.id)?.img || '')
          ? { images: [menu.products.find((p) => p.id === it.id)!.img] }
          : {} ),
      },
    },
  }));
  if (fee > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: 'eur',
        unit_amount: euro(fee),
        product_data: { name: 'Frais de livraison' },
      },
    });
  }

  try {
    let couponId: string | undefined;
    if (discount > 0) {
      const coupon = await stripe.coupons.create(
        { amount_off: euro(discount), currency: 'eur', duration: 'once', name: `Code promo ${appliedCode}` },
        stripeAccount() ? { stripeAccount: stripeAccount() } : undefined
      );
      couponId = coupon.id;
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        locale: 'fr',
        line_items: lineItems as never,
        ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
        success_url: `${origin}/commander?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/commander?canceled=1`,
        metadata: { num, phone, mode },
      },
      stripeAccount() ? { stripeAccount: stripeAccount() } : undefined
    );

    /* ---- 4. Commande enregistrée (Firestore si configuré) ---- */
    const order: Omit<Order, 'id'> = {
      num,
      createdAt: Date.now(),
      mode,
      payment: 'card',
      paid: false, // confirmé par le webhook Stripe
      status: 'nouvelle',
      items,
      subtotal,
      discount,
      fee,
      total,
      ...(appliedCode ? { promoCode: appliedCode } : {}),
      customer: {
        name: body.customer?.name?.trim() || undefined,
        phone,
        address: mode === 'delivery' ? body.customer?.address?.trim() : undefined,
        note: body.customer?.note?.trim() || undefined,
      },
      stripeSessionId: session.id,
    };
    const db = await getAdminDb();
    if (db) {
      await db.collection(ORDERS_COLLECTION).doc(num).set(order);
    }

    return NextResponse.json({ url: session.url, num });
  } catch (e) {
    console.error('[checkout] Stripe :', e);
    const message = e instanceof Error && e.message.includes('api key')
      ? 'Clé Stripe invalide (STRIPE_SECRET_KEY)'
      : 'Le paiement est momentanément indisponible, réessayez.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** Vérification après retour de Stripe : ?session_id=… */
export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ error: 'session_id manquant' }, { status: 400 });
  const stripe = await getStripe();
  if (!stripe) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  try {
    const session = await stripe.checkout.sessions.retrieve(
      sessionId,
      undefined,
      stripeAccount() ? { stripeAccount: stripeAccount() } : undefined
    );
    return NextResponse.json({
      paid: session.payment_status === 'paid',
      num: session.metadata?.num || null,
      total: session.amount_total != null ? session.amount_total / 100 : null,
    });
  } catch (e) {
    console.error('[checkout] GET :', e);
    return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
  }
}
