/* One-shot : corrige le menu publié dans Firestore.
   - Retire « Salade Verte » et « Oignons » des accompagnements
   - Sauces : uniquement Sauce Oignons et Sauce Verte
   - Ajoute incl {sides, drinks} aux menus (déduit du desc)
   Usage : node scripts/fix-published-menu.mjs [--dry] */
import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim()
  .replace(/^"(.*)"$/s, '$1');
const dry = process.argv.includes('--dry');

initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';
const snap = await db.doc('menu/published').get();
const menu = snap.data();
if (!menu || !Array.isArray(menu.products)) {
  console.error('menu/published introuvable ou sans produits');
  process.exit(1);
}

let products = [...menu.products];
const removeIds = new Set(['a-salade-verte', 'a-oignons', 's-algerienne', 's-samourai', 's-blanche', 's-biggy', 's-chili', 's-ketchup', 's-mayonnaise']);
products = products.filter((p) => !removeIds.has(p.id));
if (!products.some((p) => p.id === 's-oignons')) {
  products.push({ id: 's-oignons', name: 'Sauce Oignons', price: 0.5, cat: 'sauces', img: `${F}0319b8a7dabe.png`, desc: '' });
  products.push({ id: 's-verte', name: 'Sauce Verte', price: 0.5, cat: 'sauces', img: `${F}cc3feac5ad2c.jpg`, desc: '' });
}
// promos éventuelles sur les produits retirés
const promos = { ...(menu.promos || {}) };
removeIds.forEach((id) => delete promos[id]);

let nIncl = 0;
products = products.map((p) => {
  const m = typeof p.desc === 'string' ? p.desc.match(/(\d+)\s*accompagnements?\s*\+\s*(\d+)\s*boisson/) : null;
  if (m) {
    nIncl++;
    return { ...p, incl: { sides: Number(m[1]), drinks: Number(m[2]) } };
  }
  return p;
});

console.log(`Produits: ${menu.products.length} -> ${products.length} ; menus incl: ${nIncl}`);
console.log('Sauces:', products.filter((p) => p.cat === 'sauces').map((p) => p.name).join(', '));
console.log('Accompagnements:', products.filter((p) => p.cat === 'accompagnements').map((p) => p.name).join(', '));
if (dry) {
  console.log('(dry run — rien écrit)');
  process.exit(0);
}
await db.doc('menu/published').set({ ...menu, products, promos });
console.log('menu/published mis à jour ✓');
