import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { getAdminDb } from '@/lib/server/firebase-admin';
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
    await db.doc(PUBLISHED_DOC).set({ ...DEFAULT_MENU });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[admin/menu/reset] :', e);
    return NextResponse.json({ error: 'Échec de la réinitialisation' }, { status: 500 });
  }
}
