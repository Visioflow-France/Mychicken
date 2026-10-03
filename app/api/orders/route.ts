import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/* ================================================================
   Commandes « par téléphone » désactivées : le paiement se fait
   exclusivement en ligne via /api/checkout (Stripe). Cette route
   est conservée pour répondre explicitement au cas où un ancien
   client tenterait encore de commander par ce biais.
   ================================================================ */

export async function POST() {
  return NextResponse.json(
    { error: 'Les commandes par téléphone sont désactivées — le paiement se fait en ligne uniquement.' },
    { status: 403 },
  );
}
