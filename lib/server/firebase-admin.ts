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

/* NOTE : Firebase Storage n'est plus utilisé (plan Spark sans Blaze).
   Les photos des plats sont servies depuis /public/photos, livrées
   avec le site — zéro lecture/écriture Storage, zéro coût. */
