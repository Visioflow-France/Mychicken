import { NextResponse } from 'next/server';
import { adminToken, cookieHeader, expectedPassword, isAdminRequest, usingDefaultPassword } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  return NextResponse.json({ authed: isAdminRequest(req), defaultPassword: usingDefaultPassword() });
}

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || password !== expectedPassword()) {
    return NextResponse.json({ ok: false, error: 'Mot de passe incorrect' }, { status: 401 });
  }
  // Cookie valable 7 jours
  return NextResponse.json(
    { ok: true, defaultPassword: usingDefaultPassword() },
    { headers: { 'Set-Cookie': cookieHeader(adminToken(), 60 * 60 * 24 * 7) } }
  );
}

export async function DELETE() {
  return NextResponse.json({ ok: true }, { headers: { 'Set-Cookie': cookieHeader('', 0) } });
}
