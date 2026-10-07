import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(15).get();
if (snap.empty) {
  console.log('AUCUNE commande dans la collection orders');
} else {
  for (const d of snap.docs) {
    const o = d.data();
    const when = new Date(o.createdAt).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
    console.log(
      `${String(o.num || '??').padEnd(6)} | resto=${(o.locationId || 'AUCUN').padEnd(10)} | mode=${(o.mode || '?').padEnd(8)} | statut=${(o.status || '?').padEnd(8)} | payée=${o.paid ? 'oui' : 'non'} | ${when} | ${o.customer?.name || ''}`
    );
  }
}
