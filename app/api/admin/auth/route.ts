import { NextResponse } from 'next/server';
import { adminToken, cookieHeader, expectedPassword, isAdminRequest, usingDefaultPassword } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

/* ================================================================
   Authentification admin — deux modes :
   • Firebase Auth (production) : le patron se connecte avec un
     compte email/mot de passe Firebase. Le navigateur envoie l'ID
     token, le serveur le vérifie auprès de Google (accounts:lookup,
     compatible Workers — pas besoin de firebase-admin) et contrôle
     que l'e-mail figure dans ADMIN_EMAILS (liste blanche).
   • Mot de passe partagé (mode démo, sans ADMIN_EMAILS) : ancien
     comportement, cookie signé HMAC.

   Dans les deux cas la session = cookie httpOnly mc_admin (7 jours).
   ================================================================ */

/** E-mails autorisés à accéder au dashboard (ADMIN_EMAILS, séparés par des virgules). */
function allowedEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Mode de connexion affiché par le dashboard. */
function authMode(): 'firebase' | 'password' {
  const firebaseReady = Boolean(allowedEmails().length && process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
  return firebaseReady ? 'firebase' : 'password';
}

export async function GET(req: Request) {
  return NextResponse.json({
    authed: isAdminRequest(req),
    defaultPassword: usingDefaultPassword(),
    authMode: authMode(),
  });
}

type LookupResponse = { users?: { email?: string; disabled?: boolean }[] };

/** Vérifie un ID token Firebase auprès de Google. Renvoie l'e-mail du compte. */
async function verifyFirebaseToken(token: string): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) return null;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: token }),
  });
  if (!res.ok) return null; // token invalide, expiré ou Auth désactivé
  const json = (await res.json().catch(() => ({}))) as LookupResponse;
  const user = json.users?.[0];
  if (!user || user.disabled || !user.email) return null;
  return user.email.toLowerCase();
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { password?: string; firebaseToken?: string };
  const mode = authMode();

  /* ---- Connexion Firebase Auth ---- */
  if (typeof body.firebaseToken === 'string' && body.firebaseToken) {
    if (mode !== 'firebase') {
      return NextResponse.json({ ok: false, error: 'Connexion Firebase non configurée (ADMIN_EMAILS absent)' }, { status: 401 });
    }
    const email = await verifyFirebaseToken(body.firebaseToken);
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Identifiants incorrects ou session expirée' }, { status: 401 });
    }
    if (!allowedEmails().includes(email)) {
      return NextResponse.json({ ok: false, error: `Ce compte (${email}) n'est pas autorisé à gérer le restaurant` }, { status: 403 });
    }
    // Cookie valable 7 jours
    return NextResponse.json(
      { ok: true, authMode: 'firebase' },
      { headers: { 'Set-Cookie': cookieHeader(adminToken(), 60 * 60 * 24 * 7) } }
    );
  }

  /* ---- Mot de passe partagé (mode démo uniquement) ---- */
  if (mode === 'firebase') {
    return NextResponse.json({ ok: false, error: 'Connectez-vous avec votre compte (e-mail et mot de passe)' }, { status: 401 });
  }
  const { password } = body;
  if (!password || password !== expectedPassword()) {
    return NextResponse.json({ ok: false, error: 'Mot de passe incorrect' }, { status: 401 });
  }
  return NextResponse.json(
    { ok: true, defaultPassword: usingDefaultPassword(), authMode: 'password' },
    { headers: { 'Set-Cookie': cookieHeader(adminToken(), 60 * 60 * 24 * 7) } }
  );
}

export async function DELETE() {
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader('', 0) } });
}
