import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';
const MAP = {
  'menu-cuisse': '710168e7940d.jpeg',
  'menu-pilons': '3ef41981dfaa.jpg',
  'menu-wings': 'a71c24b4497a.jpg',
  'menu-ailes': 'f53a967a20ee.jpg',
  'menu-tenders': '689d1d81f67b.webp',
  'tacos-m': '0dc26223ba5a.jpg', 'tacos-l': '0dc26223ba5a.jpg', 'tacos-xl': '0dc26223ba5a.jpg',
  'assiette-poulet': '78b76491a31a.jpg',
  'salade-bulgour': '3012e6637210.jpg',
  'a-plantain': '780ef4110804.jpg',
  'b-jus-bissap': '15efb28b3c4c.png',
  's-oignons': 'dd451b7080ee.jpg',
  's-verte': '0e5d7e7ecf6c.jpg',
  'p-poulet-entier': '370197141718.jpg',
  'menu-special': '370197141718.jpg',
  'a-pommes-de-terre': '4a914acb0e8c.jpg',
  'd-tiramisu': '18260e12265e.jpg',
  'p-donut-poulet': 'cd2ae1f2d9a5.jpeg',
  'menu-donuts': 'cd2ae1f2d9a5.jpeg',
  'tasty-crousty-m': '704cc5d9b5f9.jpg', 'tasty-crousty-l': '704cc5d9b5f9.jpg', 'tasty-crousty-xl': '704cc5d9b5f9.jpg',
  'p-1-brick': '87890fc673f6.jpg',
  'menu-brick': '87890fc673f6.jpg',
  'sandwich-poulet': 'e24f4221ed77.jpg',
  'menu-sandwich': 'e24f4221ed77.jpg',
};

const snap = await db.doc('menu/published').get();
const menu = snap.data();
let n = 0;
const products = menu.products.map((p) => {
  if (MAP[p.id]) { n++; return { ...p, img: F + MAP[p.id] }; }
  return p;
});
await db.doc('menu/published').set({ ...menu, products });
console.log(n, 'photos produit mises à jour dans menu/published');
