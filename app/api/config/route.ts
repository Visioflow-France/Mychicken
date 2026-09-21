import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/* Petits indicateurs publics (aucun secret) pour afficher l'état
   du système dans /admin : quoi est configuré, quoi manque. */
export async function GET() {
  return NextResponse.json({
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    connect: Boolean(process.env.STRIPE_CONNECT_ACCOUNT_ID),
    firebaseWrite: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT ||
        (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
    ),
  });
}
