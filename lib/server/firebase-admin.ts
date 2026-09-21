/* ================================================================
   Firebase Admin (côté serveur uniquement).
   Utilisé par les routes API pour ÉCRIRE dans Firestore (carte,
   promos, commandes) — les règles de sécurité peuvent donc rester
   fermées en écriture pour les clients.

   Configuration : variable d'environnement FIREBASE_SERVICE_ACCOUNT
   contenant le JSON complet de la clé de service (Console Firebase →
   Paramètres du projet → Comptes de service → Générer une clé).
   ================================================================ */

import type { Firestore } from 'firebase-admin/firestore';

let _db: Firestore | null = null;
let _initTried = false;

function loadCredentials(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json) {
    try {
      const parsed = JSON.parse(json);
      if (parsed.projectId && parsed.clientEmail && parsed.privateKey) return parsed;
      console.error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT incomplet (projectId/clientEmail/privateKey requis)');
    } catch {
      console.error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT n\'est pas un JSON valide');
    }
    return null;
  }
  // Variante : trois variables séparées
  const projectId = process.env.FIREBASE_PROJECT_ID!;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (projectId && clientEmail && privateKey) return { projectId, clientEmail, privateKey };
  return null;
}

/** Firestore Admin, ou null si le serveur n'a pas de clé de service. */
export async function getAdminDb(): Promise<Firestore | null> {
  if (_db) return _db;
  if (_initTried) return null;
  _initTried = true;

  const creds = loadCredentials();
  if (!creds) return null;

  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(creds) });
    _db = getFirestore(app);
    return _db;
  } catch (e) {
    console.error('[firebase-admin] initialisation impossible :', e);
    return null;
  }
}

/* ---------- Lecture de la carte côté serveur (source de vérité prix) ---------- */

import { DEFAULT_MENU, type MenuData } from '../data';
import { MENU_DOC } from '../firebase';

/** Menu complet : Firestore si configuré, sinon valeurs par défaut.
    C'est LA source utilisée par /api/checkout — les prix envoyés par
    le client ne sont jamais fais confiance. */
export async function getServerMenu(): Promise<MenuData> {
  const db = await getAdminDb();
  if (!db) return DEFAULT_MENU;
  try {
    const [productsSnap, categoriesSnap, settingsSnap, promosSnap] = await Promise.all([
      db.doc(MENU_DOC.products).get(),
      db.doc(MENU_DOC.categories).get(),
      db.doc(MENU_DOC.settings).get(),
      db.doc(MENU_DOC.promos).get(),
    ]);
    return {
      products: (productsSnap.data()?.items as MenuData['products']) || DEFAULT_MENU.products,
      categories: (categoriesSnap.data()?.items as MenuData['categories']) || DEFAULT_MENU.categories,
      config: { ...DEFAULT_MENU.config, ...(settingsSnap.data()?.config as MenuData['config']) },
      banner: { ...DEFAULT_MENU.banner, ...(settingsSnap.data()?.banner as MenuData['banner']) },
      promos: (promosSnap.data()?.promos as MenuData['promos']) || {},
      promoCodes: (promosSnap.data()?.codes as MenuData['promoCodes']) || [],
    };
  } catch (e) {
    console.error('[firebase-admin] lecture du menu impossible, valeurs par défaut utilisées :', e);
    return DEFAULT_MENU;
  }
}
