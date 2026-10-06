import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/* Télécharge toutes les photos produits dans public/photos/ et
   réécrit les URLs vers l'hébergement local (le bucket de recherche
   d'images purge ses fichiers → liens morts). */
const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

fs.mkdirSync('public/photos', { recursive: true });
const snap = await db.doc('menu/published').get();
const menu = snap.data();
const results = { ok: [], dead: [], alreadyLocal: [] };
const products = [];

for (const p of menu.products) {
  if (!p.img) { products.push(p); continue; }
  if (p.img.startsWith('/')) { results.alreadyLocal.push(p.id); products.push(p); continue; }
  const ext = (p.img.match(/\.(webp|png|jpe?g)$/i) || [null, 'jpg'])[1].toLowerCase();
  const dest = `photos/${p.id}.${ext === 'jpeg' ? 'jpg' : ext}`;
  try {
    const res = await fetch(p.img, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) throw new Error('fichier vide');
    fs.writeFileSync('public/' + dest, buf);
    products.push({ ...p, img: '/' + dest });
    results.ok.push(`${p.id} (${Math.round(buf.length / 1024)} Ko)`);
  } catch (e) {
    results.dead.push(`${p.id}: ${p.img} — ${e.message}`);
    products.push({ ...p, img: '' }); // mort → à remplacer depuis l'admin (ou recherche)
  }
}

await db.doc('menu/published').set({ ...menu, products });
console.log('OK (%d):', results.ok.length, '\n  ' + results.ok.join('\n  '));
console.log('MORTS (%d):', results.dead.length, '\n  ' + results.dead.join('\n  '));
console.log('Déjà locaux:', results.alreadyLocal.join(', ') || 'aucun');
