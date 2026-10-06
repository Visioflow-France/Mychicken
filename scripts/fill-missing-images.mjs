import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

/* Photos locales de la même famille de plat, en attendant de vraies
   photos uploadées depuis l'admin (Firebase Storage). */
const MAP = {
  'menu-demi': '/photos/p-poulet-entier.jpg',
  'p-demi-poulet': '/photos/p-poulet-entier.jpg',
  'menu-tiers': '/photos/p-poulet-entier.jpg',
  'menu-familial': '/photos/p-poulet-entier.jpg',
  'menu-hotdog': '/photos/sandwich-poulet.jpg',
  'p-hotdog': '/photos/sandwich-poulet.jpg',
  'menu-saucisses': '/photos/sandwich-poulet.jpg',
  'p-1-saucisse': '/photos/sandwich-poulet.jpg',
  'menu-mixte': '/photos/menu-pilons.jpg',
  'menu-filet': '/photos/assiette-poulet.jpg',
  'sandwich-baguette': '/photos/sandwich-poulet.jpg',
  'burger-classique': '/photos/tasty-crousty-m.jpg',
  'menu-burger': '/photos/tasty-crousty-m.jpg',
  'assiette-mixte': '/photos/assiette-poulet.jpg',
  'salade-iranienne': '/photos/salade-bulgour.jpg',
  'p-3-pilons': '/photos/menu-pilons.jpg',
  'p-1-pilon': '/photos/menu-pilons.jpg',
  'p-4-ailes': '/photos/menu-ailes.jpg',
  'p-6-wings': '/photos/menu-wings.jpg',
  'p-1-cuisse': '/photos/menu-cuisse.jpg',
  'p-3-tenders': '/photos/menu-tenders.jpg',
  'p-4-nems': '/photos/menu-brick.jpg',
  'a-potatoes': '/photos/a-pommes-de-terre.jpg',
  'a-pates': '/photos/assiette-poulet.jpg',
  'b-coca-1l5': '/photos/b-canette.jpg',
};

const snap = await db.doc('menu/published').get();
const menu = snap.data();
let n = 0;
const products = menu.products.map((p) => {
  if (MAP[p.id] && (!p.img || p.img === '')) { n++; return { ...p, img: MAP[p.id] }; }
  return p;
});
await db.doc('menu/published').set({ ...menu, products });
console.log(n, 'photos manquantes réassignées (familles locales)');

/* data.ts : passer toutes les img sur les fichiers locaux équivalents */
let s = fs.readFileSync('lib/data.ts', 'utf8');
const local = {};
for (const p of products) if (p.img?.startsWith('/photos/')) local[p.id] = p.img;
let m = 0;
for (const [id, path] of Object.entries(local)) {
  const re = new RegExp("(\\{ id: '" + id + "',[^(]*?img: `)[^`]+(`)", 's');
  const before = s;
  s = s.replace(re, (mm, a, b) => a + path + b);
  if (s !== before) m++;
}
fs.writeFileSync('lib/data.ts', s);
console.log(m, 'produits data.ts passés en local');
