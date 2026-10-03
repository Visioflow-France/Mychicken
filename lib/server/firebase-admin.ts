/* ================================================================
   Firestore côté serveur — via l'API REST (compatible Cloudflare
   Workers, où firebase-admin/protobufjs ne peut pas tourner).

   Configuration : variable d'environnement FIREBASE_SERVICE_ACCOUNT
   contenant le JSON complet de la clé de service (Console Firebase →
   Paramètres du projet → Comptes de service → Générer une clé).
   ================================================================ */

import type { FirestoreRestClient } from './firestore-rest';
import { DEFAULT_MENU, type MenuData } from '../data';
import { PUBLISHED_DOC } from '../firebase';

let _db: FirestoreRestClient | null = null;
let _initTried = false;

function loadCredentials(): { project_id: string; client_email: string; private_key: string } | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (parsed.project_id && parsed.client_email && parsed.private_key) return parsed;
      console.error('[firestore-rest] FIREBASE_SERVICE_ACCOUNT incomplet (project_id/client_email/private_key requis)');
    } catch {
      console.error('[firestore-rest] FIREBASE_SERVICE_ACCOUNT n\'est pas un JSON valide');
    }
    return null;
  }
  return null;
}

/** Client Firestore REST, ou null si la clé de service n'est pas configurée. */
export async function getAdminDb(): Promise<FirestoreRestClient | null> {
  if (_db) return _db;
  if (_initTried) return null;
  _initTried = true;

  const creds = loadCredentials();
  if (!creds) return null;

  try {
    const { createFirestoreRestClient } = await import('./firestore-rest');
    _db = createFirestoreRestClient(creds);
    return _db;
  } catch (e) {
    console.error('[firestore-rest] initialisation impossible :', e);
    return null;
  }
}

/* ---------- Lecture de la carte côté serveur (source de vérité prix) ---------- */

/** Menu complet : 1 SEULE lecture du doc unique menu/published.
    C'est LA source utilisée par /api/checkout — les prix envoyés par
    le client ne sont jamais fais confiance. Fallback embarqué en cas
    d'erreur réseau. */
export async function getServerMenu(): Promise<MenuData> {
  const db = await getAdminDb();
  if (!db) return DEFAULT_MENU;
  try {
    const snap = await db.doc(PUBLISHED_DOC).get();
    const d = snap.data() as Partial<MenuData> | undefined;
    if (!d || !Array.isArray(d.products) || d.products.length === 0) return DEFAULT_MENU;
    return {
      ...DEFAULT_MENU,
      products: d.products,
      categories: d.categories || DEFAULT_MENU.categories,
      promos: d.promos || {},
      promoCodes: d.promoCodes || [],
      config: { ...DEFAULT_MENU.config, ...d.config },
      banner: { ...DEFAULT_MENU.banner, ...d.banner },
      locations: d.locations || DEFAULT_MENU.locations,
    };
  } catch (e) {
    console.error('[firestore-rest] lecture du menu impossible, valeurs par défaut utilisées :', e);
    return DEFAULT_MENU;
  }
}

/* ---------- Firebase Storage via REST (images des plats) ---------- */

const SCOPES = 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write';

let _cachedTokenGetter: (() => Promise<string>) | null = null;

/** Jeton Google avec accès Firestore + Storage (mise en cache automatique). */
export async function getGoogleToken(): Promise<string | null> {
  const sa = loadCredentials();
  if (!sa) return null;
  if (!_cachedTokenGetter) {
    _cachedTokenGetter = async () => {
      const { getAccessTokenWithScopes } = await import('./firestore-rest');
      return getAccessTokenWithScopes(sa, SCOPES, globalThis.crypto);
    };
  }
  try {
    return await _cachedTokenGetter();
  } catch (e) {
    console.error('[storage] jeton impossible :', e);
    return null;
  }
}

function bucketName(): string | null {
  return process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mychicken-b3edf'}.firebasestorage.app`;
}

/** URL publique d'un objet Storage (doit matcher ce host pour le nettoyage). */
export function storagePublicUrl(path: string, token: string): string {
  return `https://firebasestorage.app/v0/b/${bucketName()}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/** URL publique du bucket — sert à reconnaître nos images. */
export function storageHost(): string {
  return 'firebasestorage.app';
}

/** Téléverse un octet vers Storage ; renvoie l'URL publique. */
export async function uploadToStorage(bytes: Uint8Array, path: string, contentType: string): Promise<string | null> {
  const token = await getGoogleToken();
  if (!token) return null;
  const bucket = bucketName();
  const res = await fetch(
    `https://firebasestorage.app/v0/b/${bucket}/o?uploadType=media&name=${encodeURIComponent(path)}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
      body: bytes.slice().buffer as ArrayBuffer,
    }
  );
  if (!res.ok) {
    console.error('[storage] upload échoué :', res.status, (await res.text()).slice(0, 200));
    return null;
  }
  const json = (await res.json()) as { downloadTokens?: string; name?: string };
  return storagePublicUrl(json.name || path, json.downloadTokens || '');
}

/** Supprime un objet Storage à partir de son URL publique. */
export async function deleteStorageUrl(url: string): Promise<void> {
  try {
    if (!url.includes(storageHost())) return; // image externe (Unsplash…) : rien à faire
    const token = await getGoogleToken();
    if (!token) return;
    const u = new URL(url);
    const objectPath = decodeURIComponent(u.pathname.split('/o/')[1] || '');
    if (!objectPath) return;
    const bucket = bucketName()!;
    const res = await fetch(
      `https://firebasestorage.app/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) console.error('[storage] suppression échouée :', res.status, objectPath);
  } catch (e) {
    console.error('[storage] suppression impossible :', e);
  }
}

/** Nettoyage des orphelins : supprime du Storage toute image du bucket
    qui n'est plus référencée par la carte publiée. Appelé à chaque
    publication — garantit qu'un plat supprimé ou re-photographié
    n'occupe plus d'espace inutilement. */
export async function sweepOrphanImages(currentUrls: string[]): Promise<void> {
  try {
    const token = await getGoogleToken();
    if (!token) return;
    const bucket = bucketName()!;
    const host = storageHost();
    const keep = new Set(currentUrls.filter((u) => typeof u === 'string'));

    // Liste les objets du dossier products/ (une requête, 1000 objets max)
    const res = await fetch(
      `https://firebasestorage.app/v0/b/${bucket}/o?prefix=products/&maxResults=1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const json = (await res.json()) as { items?: { name: string }[] };
    for (const item of json.items || []) {
      const publicUrl = `${host}/v0/b/${bucket}/o/${encodeURIComponent(item.name)}`;
      const referenced = [...keep].some((u) => u.startsWith(publicUrl));
      if (!referenced) {
        const del = await fetch(
          `https://firebasestorage.app/v0/b/${bucket}/o/${encodeURIComponent(item.name)}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        );
        if (del.ok) console.log(`[storage] orphelin supprimé : ${item.name}`);
      }
    }
  } catch (e) {
    console.error('[storage] balayage orphelins impossible :', e);
  }
}
