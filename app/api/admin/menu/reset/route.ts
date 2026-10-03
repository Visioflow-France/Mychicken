import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb, sweepOrphanImages } from '@/lib/server/firebase-admin';
import { PUBLISHED_DOC } from '@/lib/firebase';
import { DEFAULT_MENU } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Remet la carte du doc unique menu/published aux valeurs d'origine du flyer. */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const db = await getAdminDb();
  if (!db) {
    return NextResponse.json({ error: 'Firebase non configuré sur le serveur' }, { status: 503 });
  }
  try {
    const existing = await db.doc(PUBLISHED_DOC).get();
    const prevData = existing.data() as Partial<typeof DEFAULT_MENU> | undefined;

    await db.doc(PUBLISHED_DOC).set({ ...DEFAULT_MENU });

    // Les images du bucket ne sont plus référencées par les valeurs du flyer
    void sweepOrphanImages(DEFAULT_MENU.products.map((p) => p.img).filter(Boolean));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/menu/reset] :', e);
    return NextResponse.json({ error: 'Échec de la réinitialisation' }, { status: 500 });
  }
}
