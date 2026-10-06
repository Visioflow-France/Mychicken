import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const HOURS = 'Lun–Dim · 11h30–21h30 (vendredi : fermeture 13h–14h30)';
const snap = await db.doc('menu/published').get();
const menu = snap.data();
const patch = {
  ...menu,
  locations: menu.locations.map((l) =>
    l.id === 'saint-mard'
      ? { ...l, address: 'ZAC de la Fontaine du Berger', hours: HOURS }
      : l.id === 'persan'
        ? { ...l, hours: HOURS }
        : l
  ),
};
await db.doc('menu/published').set(patch);
console.log('locations mises à jour:', JSON.stringify(patch.locations.map(l => ({ id: l.id, address: l.address, hours: l.hours })), null, 1));
