import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const ref = db.doc('menu/published');
const menu = (await ref.get()).data();

const TASTY = {
  id: 'tasty-menu',
  name: 'Menu Tasty Crousty',
  price: 7.9,
  cat: 'menus',
  img: '/photos/tasty-m.jpg',
  desc: 'Riz thaï, sauce crousty maison, poulet croustillant, onions crispy + 1 boisson 33 cl — taille et recette au choix',
  incl: { sides: 0, drinks: 1 },
  recipes: [
    { id: 'original', name: 'Original', desc: 'Sauce chili thaï, persil' },
    { id: 'dynamite', name: 'Dynamite', desc: 'Sauce piquante, persil, aneth' },
    { id: 'boursin', name: 'Boursin', desc: 'Sauce boursin, persil, ciboulette' },
    { id: 'dz', name: 'Dz', desc: 'Sauce algérienne, persil' },
  ],
  sizes: [
    { id: 'm', label: 'M', price: 7.9 },
    { id: 'l', label: 'L', price: 9.9 },
    { id: 'xl', label: 'XL', price: 10.9 },
  ],
};

/* 1 · Une seule carte Tasty Crousty (taille choisie à l'ajout) */
const idx = menu.products.findIndex((p) => p.id.startsWith('tasty-'));
if (idx >= 0) {
  const count = menu.products.filter((p) => p.id.startsWith('tasty-')).length;
  menu.products.splice(idx, count, TASTY);
  console.log(`tasty: ${count} produits remplacés par 1 (taille M/L/XL à l'ajout)`);
} else if (menu.products.some((p) => p.id === 'tasty-menu')) {
  console.log('tasty-menu déjà présent');
} else {
  menu.products.unshift(TASTY);
  console.log('tasty-menu ajouté en tête');
}

/* 2 · Sandwich baguette : poulet braisé précisé */
const sw = menu.products.find((p) => p.id === 'sandwich-baguette');
if (sw) {
  sw.name = 'Sandwich Baguette (Poulet Braisé)';
  sw.desc = 'Poulet braisé grillé au feu de bois — servi avec fromage, crudités et une sauce maison';
  console.log('sandwich-baguette renommé:', sw.name);
}

/* 3 · Nettoyage : plus aucune promo ne vise les anciens ids tasty-m/l/xl */
for (const old of ['tasty-m', 'tasty-l', 'tasty-xl']) delete menu.promos?.[old];

await ref.set(menu);
console.log('Firestore mis à jour —', menu.products.length, 'produits');
