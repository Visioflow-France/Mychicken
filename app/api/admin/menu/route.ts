import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
import { MENU_DOC } from '@/lib/firebase';
import type { MenuData } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Publie le menu complet dans Firestore (4 documents, écriture atomique enough pour un menu de resto). */
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
    await Promise.all([
      db.doc(MENU_DOC.products).set({ items: body.products }),
      db.doc(MENU_DOC.categories).set({ items: body.categories }),
      db.doc(MENU_DOC.settings).set({ config: body.config, banner: body.banner }),
      db.doc(MENU_DOC.promos).set({ promos: body.promos || {}, codes: body.promoCodes || [] }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/menu] échec de publication :', e);
    return NextResponse.json({ error: 'Échec de la publication dans Firestore' }, { status: 500 });
  }
}
