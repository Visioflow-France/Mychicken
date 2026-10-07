import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const snap = await db.doc('menu/published').get();
const menu = snap.data();
for (const p of menu.products) {
  console.log(`${p.id} | ${p.cat} | ${p.name} | ${p.price}€ | img=${p.img || 'AUCUNE'}`);
  if (p.desc) console.log(`    desc: ${p.desc}`);
}
console.log('TOTAL:', menu.products.length);
