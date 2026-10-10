/* ================================================================
   OPTIMISATION DES PHOTOS DE LA CARTE
   --------------------------------------------------------------
   1. Recadrage 4:3 (homogène avec l'affichage des cartes) à la
      pleine résolution du fichier source, sans jamais agrandir.
   2. Génération de variantes responsives (-480 / -800 / -1200)
      en WebP ET JPEG haute qualité : le navigateur ne télécharge
      que la largeur utile (mobile vs ordinateur) via srcset/sizes.
   3. Écriture du manifeste lib/photo-variants.json consommé par
      SmartImg (les URL externes — Storage, Unsplash — l'ignorent).

   Usage :  node scripts/optimize-photos.mjs
   ================================================================ */

import sharp from 'sharp';
import { readdirSync, writeFileSync, renameSync, existsSync, rmSync } from 'node:fs';
import { join, basename } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.cwd();
const PHOTOS_DIR = join(ROOT, 'public', 'photos');
const MANIFEST_PATH = join(ROOT, 'lib', 'photo-variants.json');

/* Sur Windows, l'écriture sur un fichier existant peut tomber sur un verrou
   transitoire (antivirus, indexeur) → on réessaie, puis on passe par un
   fichier temporaire renommé. */
async function safeWrite(file, buf) {
  for (let i = 0; i < 4; i++) {
    try {
      writeFileSync(file, buf);
      return;
    } catch {
      await sleep(150); // verrou Windows transitoire → on réessaie
    }
  }
  const tmp = `${file}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 6)}`;
  writeFileSync(tmp, buf);
  try {
    renameSync(tmp, file);
  } catch (e) {
    if (existsSync(tmp)) rmSync(tmp, { force: true });
    throw e;
  }
}

const ASPECT = 4 / 3; // ratio d'affichage des cartes
const WIDTHS = [480, 800, 1200]; // largeurs responsives générées
const JPEG_Q = 90;
const WEBP_Q = 90;

/* Nouvelles photos du restaurant (dossier racine) → base dans public/photos.
   Le nom de base est volontairement IDENTIQUE au fichier actuel : la carte
   publiée dans Firestore (qui référence /photos/xxx.jpg) voit donc les
   nouvelles photos sans republication. */
const NEW_PHOTOS = {
  'saucisse.PNG': 'p-1-saucisse',
  'menu ailes.PNG': 'menu-ailes',
  'menu donut.PNG': 'menu-donuts',
  'Menu pilon.png': 'menu-pilons',
  'Menu wings.png': 'menu-wings',
  'Menu cuisse.png': 'menu-cuisse',
  'menu tenders.PNG': 'menu-tenders',
  '1 pilon.PNG': 'p-1-pilon',
  'ailes.PNG': 'p-4-ailes',
  'banane plantain.PNG': 'a-plantain',
  'boursin.PNG': 'tasty-boursin',
  'brick.PNG': 'p-1-brick',
  'cuisse de poulet.PNG': 'p-1-cuisse',
  'demi poulet.PNG': 'p-demi-poulet',
  'donut de poulet.PNG': 'p-donut-poulet',
  'dynamite.PNG': 'tasty-dynamite',
  'dz.PNG': 'tasty-dz',
  'frites.PNG': 'a-frites',
  'hot dog.PNG': 'p-hotdog',
  'menu tasty crousty.PNG': 'tasty-m',
  'nems.PNG': 'p-4-nems',
  'original.PNG': 'tasty-original',
  'pommes de terre.PNG': 'a-pommes-de-terre',
  'potatoes.PNG': 'a-potatoes',
  'poulet entier.PNG': 'p-poulet-entier',
  'riz thai.PNG': 'a-riz-thai',
  'tarte au daim.PNG': 'd-tarte-daim',
  'tenders.PNG': 'p-3-tenders',
  'tiramisu.PNG': 'd-tiramisu',
  'wings.PNG': 'p-6-wings',
  'menu hot dog.PNG': 'menu-hotdog',
  'Menu demi poulet.png': 'menu-demi',
};

const manifest = {};
const report = [];

const kb = (n) => `${Math.round(n / 1024)} Ko`;

/* Zone de recadrage 4:3 centrée, aux dimensions maximales du source */
async function cropInfo(file) {
  const meta = await sharp(file).metadata();
  let w = meta.width;
  let h = meta.height;
  if (w / h > ASPECT) w = Math.round(h * ASPECT); // trop large → on rogne les côtés
  else h = Math.round(w / ASPECT); // trop haut → on rogne haut/bas
  return { w, h, left: Math.floor((meta.width - w) / 2), top: Math.floor((meta.height - h) / 2) };
}

/* Écrit la base pleine résolution (.jpg + .webp) et les variantes
   responsives, puis déclare le tout dans le manifeste. */
async function emitBase(pipeline, base, fullW, sourceLabel) {
  const jpgBuf = await pipeline.clone().jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();
  await safeWrite(join(PHOTOS_DIR, `${base}.jpg`), jpgBuf);

  const webpBuf = await pipeline.clone().webp({ quality: WEBP_Q, effort: 6 }).toBuffer();
  await safeWrite(join(PHOTOS_DIR, `${base}.webp`), webpBuf);

  let total = jpgBuf.length + webpBuf.length;
  const widths = [];

  for (const w of WIDTHS) {
    if (w >= fullW * 0.95) continue; // jamais d'agrandissement, pas de doublon
    const j = await pipeline.clone().resize({ width: w, kernel: 'lanczos3' }).jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();
    await safeWrite(join(PHOTOS_DIR, `${base}-${w}.jpg`), j);
    const v = await pipeline.clone().resize({ width: w, kernel: 'lanczos3' }).webp({ quality: WEBP_Q, effort: 6 }).toBuffer();
    await safeWrite(join(PHOTOS_DIR, `${base}-${w}.webp`), v);
    widths.push(w);
    total += j.length + v.length;
  }

  manifest[`/photos/${base}.jpg`] = [...widths, fullW];
  report.push(`${sourceLabel.padEnd(34)} ${String(fullW).padStart(5)}px  total ${kb(total)}`);
}

/* ---------- 1. Nouvelles photos (recadrage 4:3 pleine résolution) ---------- */
for (const [src, base] of Object.entries(NEW_PHOTOS)) {
  const file = join(ROOT, src);
  const { w, h, left, top } = await cropInfo(file);
  const pipeline = sharp(file).extract({ left, top, width: w, height: h });
  await emitBase(pipeline, base, w, `${src} → ${base}`);
}

/* ---------- 2. Variantes pour les photos existantes non remplacées ---------- */
const replaced = new Set(Object.values(NEW_PHOTOS));
const existing = readdirSync(PHOTOS_DIR)
  .filter((f) => f.endsWith('.jpg') && !/-\d+\.jpg$/.test(f))
  .map((f) => basename(f, '.jpg'))
  .filter((base) => !replaced.has(base));

for (const base of existing) {
  const file = join(PHOTOS_DIR, `${base}.jpg`);
  const meta = await sharp(file).metadata();
  await emitBase(sharp(file), base, meta.width, `(existante) ${base}`);
}

/* ---------- 3. Manifeste ---------- */
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(report.join('\n'));
console.log(`\n${Object.keys(manifest).length} photos dans le manifeste → lib/photo-variants.json`);
