import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { ORDERS_COLLECTION } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/data';

export const dynamic = 'force-dynamic';

const STATUSES: OrderStatus[] = ['nouvelle', 'en_preparation', 'prete', 'terminee', 'annulee'];

/** Liste des 100 dernières commandes. */
export async function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const db = await getAdminDb();
  if (!db) return NextResponse.json({ error: 'Firebase non configuré sur le serveur' }, { status: 503 });
  try {
    const snap = await db
      .collection(ORDERS_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const orders = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }));
    return NextResponse.json({ orders });
  } catch (e) {
    console.error('[admin/orders] :', e);
    return NextResponse.json({ error: 'Lecture des commandes impossible' }, { status: 500 });
  }
}

/** Met à jour le statut ou le paiement d'une commande. */
export async function PATCH(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: OrderStatus; paid?: boolean };
  if (!body.id) return NextResponse.json({ error: 'id manquant' }, { status: 400 });
  if (body.status && !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }
  const db = await getAdminDb();
  if (!db) return NextResponse.json({ error: 'Firebase non configuré sur le serveur' }, { status: 503 });
  try {
    const patch: Record<string, unknown> = {};
    if (body.status) patch.status = body.status;
    if (typeof body.paid === 'boolean') patch.paid = body.paid;
    await db.collection(ORDERS_COLLECTION).doc(body.id).update(patch);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/orders] patch :', e);
    return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
  }
}
