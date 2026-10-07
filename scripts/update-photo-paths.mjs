import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/* Chemins d'images à mettre à jour (les autres ne changent pas :
   le fichier a été remplacé mais garde le même nom). */
const MAP = {
  'tasty-m': '/photos/tasty-m.jpg',
  'tasty-l': '/photos/tasty-l.jpg',
  'tasty-xl': '/photos/tasty-xl.jpg',
  'menu-demi': '/photos/menu-demi.jpg',
  'menu-hotdog': '/photos/menu-hotdog.jpg',
  'menu-tenders': '/photos/menu-tenders.jpg',
  'menu-familial': '/photos/menu-familial.jpg',
  'menu-saucisses': '/photos/menu-saucisses.jpg',
  'sandwich-baguette': '/photos/sandwich-baguette.jpg',
  'p-4-nems': '/photos/p-4-nems.jpg',
  'p-3-pilons': '/photos/p-3-pilons.jpg',
  'p-6-wings': '/photos/p-6-wings.jpg',
  'p-4-ailes': '/photos/p-4-ailes.jpg',
  'p-1-cuisse': '/photos/p-1-cuisse.jpg',
  'p-1-pilon': '/photos/p-1-pilon.jpg',
  'p-3-tenders': '/photos/p-3-tenders.jpg',
  'p-1-saucisse': '/photos/p-1-saucisse.jpg',
  'p-demi-poulet': '/photos/p-demi-poulet.jpg',
  'p-hotdog': '/photos/p-hotdog.jpg',
  'a-potatoes': '/photos/a-potatoes.jpg',
  'a-pates': '/photos/a-pates.jpg',
  'b-jus-bissap': '/photos/b-jus-bissap.jpg',
  'b-coca-1l5': '/photos/b-coca-1l5.jpg',
};

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

/* 1) Firestore : menu/published */
const ref = db.doc('menu/published');
const snap = await ref.get();
const menu = snap.data();
let changed = 0;
const seen = new Set();
menu.products = menu.products.map((p) => {
  seen.add(p.img);
  if (MAP[p.id] && MAP[p.id] !== p.img) {
    changed++;
    console.log(`[firestore] ${p.id}: ${p.img} -> ${MAP[p.id]}`);
    return { ...p, img: MAP[p.id] };
  }
  return p;
});
await ref.set(menu);
console.log(`Firestore: ${changed} chemins mis à jour`);

/* Vérif anti-doublon : deux produits ne doivent pas partager la même image */
const byImg = {};
for (const p of menu.products) (byImg[p.img] ||= []).push(p.id);
for (const [img, ids] of Object.entries(byImg)) if (ids.length > 1) console.log(`DOUBLON ${img}: ${ids.join(', ')}`);

const manquants = Object.keys(MAP).filter((id) => !menu.products.some((p) => p.id === id));
if (manquants.length) console.log('IDS INTROUVABLES DANS FIRESTORE:', manquants);

/* 2) lib/data.ts — patch des img: '…' pour les mêmes produits */
let src = fs.readFileSync('lib/data.ts', 'utf8');
let patched = 0;
for (const [id, img] of Object.entries(MAP)) {
  // img peut être entre simples quotes OU backticks dans data.ts
  const re = new RegExp("(id: '" + id + "',[^}]*?img: )('|\`)([^'\`]+)\\2");
  if (re.test(src)) {
    src = src.replace(re, `$1'${img}'`);
    patched++;
  } else {
    console.log(`[data.ts] INTROUVABLE: ${id}`);
  }
}
fs.writeFileSync('lib/data.ts', src);
console.log(`data.ts: ${patched} produits patchés`);
