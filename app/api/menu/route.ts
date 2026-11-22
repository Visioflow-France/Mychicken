import { NextResponse } from 'next/server';
import { getServerMenu } from '@/lib/server/firebase-admin';

export const dynamic = 'force-dynamic';

/* ================================================================
   Menu public OPTIMISÉ QUOTA SPARK (cache serveur).
   Les visiteurs ne touchent JAMAIS Firestore directement : ce
   endpoint sert la carte, mis en cache 60 s dans l'edge Cloudflare
   (Cache API). Résultat : 100 visiteurs en 1 minute = 1 SEULE
   lecture Firestore au lieu de 100. Revalidation : la première
   requête après expiration relit Firestore, les autres attendent
   la réponse fraîche (stale-while-revalidate côté navigateur).
   ================================================================ */

export async function GET(req: Request) {
  /* Cache API Cloudflare (Workers) — absent en dev Next : on saute.
     La clé est l'URL complète : /api/menu?v=123 (rafraîchissement forcé
     après une publication) est donc une entrée distincte de /api/menu. */
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const key = new Request(req.url);

  if (cache) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }

  const menu = await getServerMenu();
  const res = NextResponse.json(menu, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=86400',
    },
  });

  if (cache) {
    /* Best-effort : si l'écriture échoue, on sert quand même. */
    await cache.put(key, res.clone()).catch(() => {});
  }
  return res;
}
