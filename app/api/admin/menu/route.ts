import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { PUBLISHED_DOC, MENU_VERSION_DOC } from '@/lib/firebase';
import { LOCATIONS, type MenuData } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Publie le menu complet dans le DOCUMENT UNIQUE menu/published
    (1 doc = 1 lecture par visiteur sur le site public — quota Spark). */
export async function PUT(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as MenuData | null;
  if (!body || !Array.isArray(body.products) || !Array.isArray(body.categories)) {
    return NextResponse.json({ error: 'Menu invalide' }, { status: 400 });
  }

  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: 'Firebase non configuré sur le serveur (FIREBASE_SERVICE_ACCOUNT manquant)' },
      { status: 503 }
    );
  }

  try {
    // Les fiches restaurants sont préservées (éditées via /api/admin/locations)
    const existing = await db.doc(PUBLISHED_DOC).get();
      const prevData = existing.data() as Partial<MenuData> | undefined;

    await db.doc(PUBLISHED_DOC).set({
      products: body.products,
      categories: body.categories,
      config: body.config,
      banner: body.banner,
      promos: body.promos || {},
      promoCodes: body.promoCodes || [],
      locations: prevData?.locations || LOCATIONS,
    });

    // Version bumpée : tous les navigateurs des visiteurs recharge la
    // carte instantanément (ils écoutent ce mini-document).
    await db.doc(MENU_VERSION_DOC).set({ at: Date.now() });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/menu] échec de publication :', e);
    return NextResponse.json({ error: 'Échec de la publication dans Firestore' }, { status: 500 });
  }
}
