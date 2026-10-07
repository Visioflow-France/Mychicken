import { NextResponse, type NextRequest } from 'next/server';

/* Sous-domaines dédiés aux restaurants (ex. persan.mondomaine.fr) :
   la racine du sous-domaine ouvre directement le dashboard du resto.
   Domaine-agnostique — fonctionnera avec n'importe quel nom de domaine
   futur, sans rien re-déployer. Aucun effet sur le domaine principal,
   les workers.dev ni en local. */
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase().split(':')[0];
  if (req.nextUrl.pathname !== '/') return NextResponse.next();
  if (host.startsWith('persan.')) return NextResponse.redirect(new URL('/admin/persan', req.url));
  if (host.startsWith('saint-mard.') || host.startsWith('saintmard.') || host.startsWith('sm.')) {
    return NextResponse.redirect(new URL('/admin/saint-mard', req.url));
  }
  return NextResponse.next();
}

/* Ne s'exécute que sur la racine — zéro surcoût ailleurs. */
export const config = { matcher: '/' };
