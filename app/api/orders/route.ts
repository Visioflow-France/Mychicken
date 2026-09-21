import { NextResponse } from 'next/server';
import { getAdminDb, getServerMenu } from '@/lib/server/firebase-admin';
import { ORDERS_COLLECTION } from '@/lib/firebase';
import { clamp, promoPrice, round2, type Order, type OrderItem, type OrderMode } from '@/lib/data';

export const dynamic = 'force-dynamic';

/* ================================================================
   Commande « par téléphone » (paiement à la livraison / sur place).
   Enregistre la commande pour le dashboard /admin. Sans Firebase
   configuré, la commande est simplement confirmée (mode démo :
   le navigateur du client la garde en local pour test).
   ================================================================ */

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    items: { id: string; qty: number }[];
    mode: OrderMode;
    promoCode?: string;
    customer: { name?: string; phone: string; address?: string; note?: string };
  } | null;

  if (!body || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  }
  const phone = (body.customer?.phone || '').trim();
  if (phone.replace(/\D/g, '').length < 9) {
    return NextResponse.json({ error: 'Téléphone invalide' }, { status: 400 });
  }
  const mode: OrderMode = ['takeaway', 'dinein', 'delivery'].includes(body.mode) ? body.mode : 'takeaway';

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
  if (!items.length) return NextResponse.json({ error: 'Aucun article disponible' }, { status: 400 });

  const subtotal = round2(items.reduce((s, it) => s + it.price * it.qty, 0));
  const fee = mode === 'delivery' ? menu.config.deliveryFee : 0;
  if (mode === 'delivery' && subtotal < menu.config.minDelivery) {
    return NextResponse.json({ error: `Livraison possible dès ${menu.config.minDelivery} €` }, { status: 400 });
  }

  let discount = 0;
  let appliedCode: string | undefined;
  const wanted = (body.promoCode || '').trim().toUpperCase();
  if (wanted) {
    const code = menu.promoCodes.find((c) => c.active && c.code === wanted);
    if (code && subtotal >= (code.minTotal || 0)) {
      discount = code.type === 'percent' ? round2(subtotal * code.value / 100) : round2(Math.min(code.value, subtotal));
      appliedCode = code.code;
    }
  }

  const num = 'MC-' + Date.now().toString(36).toUpperCase().slice(-6);
  const order: Omit<Order, 'id'> = {
    num,
    createdAt: Date.now(),
    mode,
    payment: 'phone',
    paid: false,
    status: 'nouvelle',
    items,
    subtotal,
    discount,
    fee,
    total: round2(subtotal - discount + fee),
    ...(appliedCode ? { promoCode: appliedCode } : {}),
    customer: {
      name: body.customer?.name?.trim() || undefined,
      phone,
      address: mode === 'delivery' ? body.customer?.address?.trim() : undefined,
      note: body.customer?.note?.trim() || undefined,
    },
  };

  const db = await getAdminDb();
  if (db) {
    await db.collection(ORDERS_COLLECTION).doc(num).set(order);
  }

  // Le total détaillé est renvoyé pour que le client voie les mêmes chiffres que la cuisine
  return NextResponse.json({ ok: true, num, order: { ...order, id: num }, firebase: Boolean(db) });
}
