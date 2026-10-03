import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { PUBLISHED_DOC } from '@/lib/firebase';
import { LOCATIONS, type MenuData, type RestaurantLocation } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Met à jour les fiches restaurants DANS le document unique menu/published
    (aucune lecture supplémentaire pour les visiteurs). */
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { locations: RestaurantLocation[] } | null;
  if (!body || !Array.isArray(body.locations) || body.locations.length === 0) {
    return NextResponse.json({ error: 'Fiches restaurants invalides' }, { status: 400 });
  }

  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: 'Firebase non configuré sur le serveur' }, { status: 503 });
  }

  try {
    // Lecture-modification-écriture du champ locations du doc unique
    const existing = await db.doc(PUBLISHED_DOC).get();
    const prev = existing.data() as Partial<MenuData> | undefined;
    const base: MenuData = {
      ...(
        prev && Array.isArray(prev.products)
          ? { ...prev }
          : {
              products: [],
              categories: [],
              promos: {},
              promoCodes: [],
              banner: { active: false, text: '' },
              config: { deliveryFee: 2.9, minDelivery: 25, open: true },
              locations: LOCATIONS,
            } as MenuData
      ),
    } as MenuData;
    await db.doc(PUBLISHED_DOC).set({ ...base, locations: body.locations });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/locations] échec de publication :', e);
    return NextResponse.json({ error: 'Échec de la publication dans Firestore' }, { status: 500 });
  }
}
