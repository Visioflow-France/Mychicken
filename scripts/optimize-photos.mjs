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
import { readdirSync, readFileSync, writeFileSync, renameSync, existsSync, rmSync } from 'node:fs';
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
  // ---- fournies le 11/10/2026 (3 photos) ----
  'brick.PNG': 'p-1-brick',
  'image 1.jpg': 'histoire-1',
  'image 2.PNG': 'histoire-2',
  // ---- fournies le 10/10/2026 (28 photos) ----
  '3 pilons.PNG': 'p-3-pilons',
  'menu tasty crousty.PNG': 'tasty-m',
  'menu cuisse.PNG': 'menu-cuisse',
  'menu demi poulet.PNG': 'menu-demi',
  'menu hot dog.PNG': 'menu-hotdog',
  'menu pilons.PNG': 'menu-pilons',
  'menu wings.PNG': 'menu-wings',
  'menu donut.PNG': 'menu-donuts',
  'menu tenders.PNG': 'menu-tenders',
  'menu ailes.PNG': 'menu-ailes',
  'menu familial.PNG': 'menu-familial',
  'menu brick.PNG': 'menu-brick',
  'menu saucisses.PNG': 'menu-saucisses',
  'sandwich baguette.PNG': 'sandwich-baguette',
  'ailes.PNG': 'p-4-ailes',
  'tenders.PNG': 'p-3-tenders',
  'wings.PNG': 'p-6-wings',
  'demi-poulet.PNG': 'p-demi-poulet',
  'poulet entier.PNG': 'p-poulet-entier',
  'sauce oignon.PNG': 's-oignons',
  'sauce verte.PNG': 's-verte',
  'tarte au daim.PNG': 'd-tarte-daim',
  'jus de bissap.PNG': 'b-jus-bissap',
  'jus de gingembre.PNG': 'b-jus-gingembre',
  'canette 33 cl.PNG': 'b-canette',
  'red bull.PNG': 'b-redbull',
  'bouteille coca-cola 1,5 L.PNG': 'b-coca-1l5',
  'pates.PNG': 'a-pates',
};

/* Photos affichées telles quelles, SANS recadrage 4:3 : la page Histoire
   gère le ratio à l'affichage (style inline) et ces visuels ne doivent
   rien perdre — affiche portrait, photo 3:2 avec logo et texte intégrés. */
const NO_CROP = new Set(['histoire-1', 'histoire-2']);

/* « Menu familial » : le recadrage central 4:3 rogne la bouteille de
   Coca-Cola et les bords de l'assiette. On letterboxe la scène ENTIÈRE
   sur un fond flouté/assombri de la photo elle-même → tout est visible,
   sans trop dézoomer (la nourriture garde ~75 % de la hauteur). */
const FULL_FIT = new Set(['menu-familial']);

/* Manifeste précédent : les bases non remplacées dont toutes les variantes
   existent déjà sont conservées telles quelles (aucun ré-encodage, donc
   aucune perte de qualité supplémentaire à chaque exécution). */
let previous = {};
try {
  previous = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
} catch {
  /* premier lancement */
}

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
  if (!existsSync(file)) {
    console.warn(`⚠ Source absente, ignorée : ${src}`);
    continue;
  }
  /* Purge des anciennes variantes (une largeur pleine plus petite qu'avant
     peut rendre un -1200 obsolète : on repart d'un dossier propre). */
  for (const f of readdirSync(PHOTOS_DIR)) {
    if (f.startsWith(`${base}-`) && /\d+\.(jpg|webp)$/.test(f)) {
      rmSync(join(PHOTOS_DIR, f), { force: true });
    }
  }
  let pipeline;
  let fullW;
  if (NO_CROP.has(base)) {
    const meta = await sharp(file).metadata();
    pipeline = sharp(file);
    fullW = meta.width;
  } else if (FULL_FIT.has(base)) {
    /* Scène complète centrée sur canvas 4:3 ; le fond est la photo
       elle-même, zoomée pour couvrir puis floutée et assombrie. */
    const meta = await sharp(file).metadata();
    const canvasW = meta.width;
    const canvasH = Math.round(canvasW / ASPECT);
    const bg = await sharp(file)
      .resize(canvasW, canvasH, { fit: 'cover' })
      .blur(30)
      .modulate({ brightness: 0.72 })
      .toBuffer();
    const fgH = Math.round(canvasW * (meta.height / meta.width));
    const fg = await sharp(file).resize(canvasW, fgH, { kernel: 'lanczos3' }).toBuffer();
    /* Composite matérialisé en buffer : sharp applique toujours resize
       AVANT composite, ce qui casserait la génération des variantes. */
    const merged = await sharp(bg)
      .composite([{ input: fg, left: 0, top: Math.round((canvasH - fgH) / 2) }])
      .png()
      .toBuffer();
    pipeline = sharp(merged);
    fullW = canvasW;
  } else {
    const { w, h, left, top } = await cropInfo(file);
    pipeline = sharp(file).extract({ left, top, width: w, height: h });
    fullW = w;
  }
  await emitBase(pipeline, base, fullW, `${src} → ${base}`);
}

/* ---------- 2. Photos existantes non remplacées ----------
   Conserver l'entrée du manifeste précédent quand tous les fichiers sont
   présents : pas de ré-encodage (donc pas de perte de génération). Une base
   incomplète (fichier manquant, jamais passée au script) est (re)générée. */
const replaced = new Set(Object.values(NEW_PHOTOS));
const existing = readdirSync(PHOTOS_DIR)
  .filter((f) => f.endsWith('.jpg') && !/-\d+\.jpg$/.test(f))
  .map((f) => basename(f, '.jpg'))
  .filter((base) => !replaced.has(base));

for (const base of existing) {
  const key = `/photos/${base}.jpg`;
  const widths = previous[key];
  /* La dernière largeur du manifeste EST le fichier de base (plat.jpg) :
     on ne vérifie l'existence que des variantes suffixées. */
  if (
    widths &&
    existsSync(join(PHOTOS_DIR, `${base}.webp`)) &&
    widths.slice(0, -1).every((w) => existsSync(join(PHOTOS_DIR, `${base}-${w}.jpg`)) && existsSync(join(PHOTOS_DIR, `${base}-${w}.webp`)))
  ) {
    manifest[key] = widths;
    report.push(`${base.padEnd(34)} conservée telle quelle (aucun ré-encodage)`);
    continue;
  }
  const file = join(PHOTOS_DIR, `${base}.jpg`);
  const meta = await sharp(file).metadata();
  await emitBase(sharp(file), base, meta.width, `(existante) ${base}`);
}

/* ---------- 3. Manifeste ---------- */
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(report.join('\n'));
console.log(`\n${Object.keys(manifest).length} photos dans le manifeste → lib/photo-variants.json`);
