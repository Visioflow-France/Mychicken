/* ================================================================
   Authentification admin (côté serveur).
   Tant qu'ADMIN_PASSWORD n'est pas défini, le mot de passe par défaut
   « mychicken » est accepté (pratique pour tester, à remplacer en prod).
   Le cookie httpOnly mc_admin porte un jeton HMAC signé par ADMIN_SECRET.
   ================================================================ */

import crypto from 'crypto';

const DEFAULT_PASSWORD = 'mychicken';

export function expectedPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

export function adminToken(): string {
  const secret = process.env.ADMIN_SECRET || 'my-chicken-dev-secret';
  return crypto.createHmac('sha256', secret).update('mc-admin-v1').digest('hex');
}

export function cookieHeader(token: string, maxAge: number): string {
  const attrs = [`mc_admin=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`];
  return attrs.join('; ');
}

/** Vrai si la requête porte le cookie admin valide. */
export function isAdminRequest(req: Request): boolean {
  const cookies = req.headers.get('cookie') || '';
  const m = cookies.match(/(?:^|;\s*)mc_admin=([^;]+)/);
  return Boolean(m && m[1] === adminToken());
}
