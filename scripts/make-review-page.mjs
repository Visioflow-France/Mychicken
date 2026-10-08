import fs from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const env = fs.readFileSync('.env.local', 'utf8');
const sa = env.match(/^FIREBASE_SERVICE_ACCOUNT=(.*)$/m)[1].trim().replace(/^"(.*)"$/s, '$1');
initializeApp({ credential: cert(JSON.parse(sa)) });
const db = getFirestore();

const menu = (await db.doc('menu/published').get()).data();
const cats = menu.categories;
let n = 0;
const rows = [];
for (const c of cats) {
  const prods = menu.products.filter((p) => p.cat === c.id);
  if (!prods.length) continue;
  rows.push(`<h2>${c.num} · ${c.label}</h2>`);
  for (const p of prods) {
    n++;
    rows.push(`
      <div class="item">
        <div class="num">${n}</div>
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="meta">
          <b>${p.name}</b>
          <span>${p.price.toFixed(2).replace('.', ',')} €</span>
          <small>${p.desc || ''}</small>
        </div>
      </div>`);
  }
}

const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>My Chicken — revue des photos</title>
<style>
  body{font-family:Segoe UI,Arial,sans-serif;background:#241209;color:#f5ead6;margin:0;padding:1rem;max-width:720px;margin-inline:auto}
  h1{font-size:1.3rem;text-align:center}
  p.sub{text-align:center;color:#e8b84b;margin-top:-.4rem;font-size:.9rem}
  h2{margin:1.6rem 0 .5rem;border-bottom:2px solid #e8b84b;padding-bottom:.3rem;font-size:1.05rem;color:#e8b84b}
  .item{display:flex;gap:.8rem;align-items:center;background:#3d2617;border-radius:10px;padding:.6rem;margin:.45rem 0}
  .num{flex:0 0 2.2rem;height:2.2rem;border-radius:50%;background:#e8b84b;color:#241209;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:1.05rem}
  img{flex:0 0 96px;width:96px;height:72px;object-fit:cover;border-radius:8px;background:#000}
  .meta{min-width:0;display:flex;flex-direction:column;gap:.15rem}
  .meta b{font-size:.98rem}
  .meta span{color:#e8b84b;font-weight:600;font-size:.9rem}
  .meta small{color:#d8c7a8;font-size:.78rem;line-height:1.25}
</style></head><body>
<h1>🍗 My Chicken — revue des photos</h1>
<p class="sub">Donne-moi les <b>numéros</b> des photos à changer (ex. « 3, 12 et 27 »)</p>
${rows.join('\n')}
</body></html>`;

fs.writeFileSync('public/review-photos.html', html);
console.log(`OK: public/review-photos.html — ${n} produits, ${cats.length} catégories`);
