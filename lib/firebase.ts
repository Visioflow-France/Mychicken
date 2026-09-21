/* ================================================================
   Firebase (côté client) — initialisation conditionnelle.
   Tant que les variables NEXT_PUBLIC_FIREBASE_* ne sont pas définies,
   `firebaseEnabled` reste false et le site fonctionne en mode démo
   (carte statique + modifications locales via /admin).
   Dès que la config est ajoutée dans .env.local, tout passe en
   temps réel Firestore automatiquement — sans changer une ligne.
   ================================================================ */

import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseEnabled = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let _db: Firestore | null = null;

/** Base Firestore côté client, ou null si Firebase n'est pas configuré. */
export function getClientDb(): Firestore | null {
  if (!firebaseEnabled) return null;
  if (!_db) {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
    _db = getFirestore(app);
  }
  return _db;
}

/* ---------- Structure des documents Firestore ---------- */
export const MENU_DOC = { products: 'menu/products', categories: 'menu/categories', settings: 'menu/settings', promos: 'menu/promos' } as const;
export const ORDERS_COLLECTION = 'orders';
