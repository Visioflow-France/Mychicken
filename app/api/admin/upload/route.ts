import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/server/auth';
import { uploadToStorage } from '@/lib/server/firebase-admin';

export const dynamic = 'force-dynamic';

/* ================================================================
   Upload d'image de plat → Firebase Storage (via REST, clé service).
   L'image est DÉJÀ compressée en WebP côté client (max 800px, ~150 Ko)
   — le serveur ne fait que la stocker et renvoyer son URL publique.
   Les orphelins sont nettoyés à chaque publication de la carte.
   ================================================================ */

const MAX_BYTES = 400 * 1024; // garde-fou : on refuse l'énorme (le client compresse déjà)

export async function POST(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image trop lourde (compression client absente ?)' }, { status: 413 });
  }
  if (!/^image\/(webp|jpeg|png)$/.test(file.type)) {
    return NextResponse.json({ error: 'Format non supporté' }, { status: 415 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const name = `products/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${
    file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : 'jpg'
  }`;

  const url = await uploadToStorage(bytes, name, file.type);
  if (!url) {
    return NextResponse.json({ error: 'Upload Storage impossible (clé de service ?)' }, { status: 502 });
  }
  return NextResponse.json({ url, size: file.size });
}
