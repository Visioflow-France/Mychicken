/* ================================================================
   LA CARTE — My Chicken
   Transcrite fidèlement du flyer officiel (sept. 2026).
   Ces données servent de VALEURS PAR DÉFAUT : dès que Firebase
   est configuré, la carte affichée vient de Firestore (temps réel,
   modifiable depuis /admin). Sinon le site utilise ces valeurs.
   ================================================================ */

export type Category = { id: string; num: string; label: string };

/* Promo appliquée à un produit :
   - percent : -X %  ·  amount : -X €  ·  price : nouveau prix fixe */
export type ProductPromo = { type: 'percent' | 'amount' | 'price'; value: number };

/* Code promo appliqué au panier entier */
export type PromoCode = {
  code: string; // toujours stocké en majuscules
  type: 'percent' | 'amount';
  value: number;
  active: boolean;
  minTotal?: number; // minimum d'achat (€) pour utiliser le code
};

/* Bandeau promo affiché en haut du site */
export type Banner = { active: boolean; text: string };

export type SiteConfig = {
  deliveryFee: number; // frais de livraison
  minDelivery: number; // livraison à partir de X € d'achat
  open: boolean; // restaurant ouvert à la commande
};

/* Restaurant physique — la carte est commune, ces infos sont par établissement */
export type RestaurantLocation = {
  id: string;
  name: string;
  address: string;
  postal: string;
  city: string;
  phone: string;
  hours: string;
  deliveryFee: number;
  minDelivery: number;
  open: boolean;
  deliveryZones: string[]; // codes postaux livrés
  lat?: number; // position GPS (proposition du resto le plus proche)
  lng?: number;
};

export const LOCATIONS: RestaurantLocation[] = [
  {
    id: 'saint-mard',
    name: 'My Chicken Saint-Mard',
    address: 'ZAC de la Fontaine du Berger',
    postal: '77230',
    city: 'Saint-Mard',
    phone: '07 51 50 39 00',
    hours: 'Lun–Dim · 11h30–21h30 (vendredi : fermeture 13h–14h30)',
    deliveryFee: 2.9,
    minDelivery: 25,
    open: true,
    deliveryZones: ['77230', '77410', '77270', '77144'],
    lat: 49.0946,
    lng: 2.6553,
  },
  {
    id: 'persan',
    name: 'My Chicken Persan',
    address: 'Av. Jacques Vogt',
    postal: '95340',
    city: 'Persan',
    phone: '07 51 56 59 51',
    hours: 'Lun–Dim · 11h30–21h30 (vendredi : fermeture 13h–14h30)',
    deliveryFee: 2.9,
    minDelivery: 25,
    open: true,
    deliveryZones: ['95340', '95420', '95150', '95270', '95390'],
    lat: 49.1560,
    lng: 2.2856,
  },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  cat: string;
  popular?: boolean;
  img: string;
  desc: string;
  available?: boolean; // false = épuisé (affiché grisé, commande bloquée)
  /* Menus : ce que le client doit choisir en guise de contenu inclus
     (n accompagnements + n boissons, sans supplément). */
  incl?: { sides: number; drinks: number };
  /* Variantes au choix (ex. Tasty Crousty : Original, Dynamite…),
     choix obligatoire à l'ajout au panier. */
  recipes?: { id: string; name: string; desc: string }[];
  /* Tailles au choix (ex. Tasty Crousty M / L / XL) — une seule carte
     à l'écran, la taille se choisit dans la bulle d'ajout. Le prix
     affiché sur la carte est le moins cher (« dès … »). */
  sizes?: { id: string; label: string; price: number }[];
};

export type MenuData = {
  categories: Category[];
  products: Product[];
  promos: Record<string, ProductPromo>; // clé = id produit
  promoCodes: PromoCode[];
  banner: Banner;
  config: SiteConfig;
  locations?: RestaurantLocation[]; // fiches des deux restaurants (doc unique)
};

/* ---------- Commandes ---------- */
export type OrderMode = 'takeaway' | 'dinein' | 'delivery';
export type OrderStatus = 'nouvelle' | 'en_preparation' | 'prete' | 'terminee' | 'annulee';

export type OrderItem = { id: string; name: string; price: number; qty: number; note?: string };

export type Order = {
  id: string;
  num: string;
  createdAt: number;
  locationId?: string; // restaurant qui traite la commande
  mode: OrderMode;
  payment: 'card' | 'phone';
  paid: boolean;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  fee: number;
  total: number;
  promoCode?: string;
  customer: {
    name?: string;
    phone: string;
    email?: string;
    address?: string;
    /* Détails de livraison (optionnels) */
    building?: string;
    door?: string;
    accessCode?: string;
    intercom?: string;
    floor?: string;
    note?: string;
  };
  stripeSessionId?: string;
};

export const CATEGORIES: Category[] = [
  { id: 'menus', num: '01', label: 'Nos Menus' },
  { id: 'sandwichs', num: '02', label: 'Nos Sandwichs' },
  { id: 'pieces', num: '07', label: 'Pièces Séparées' },
  { id: 'accompagnements', num: '08', label: 'Nos Accompagnements' },
  { id: 'sauces', num: '09', label: 'Nos Sauces' },
  { id: 'desserts', num: '10', label: 'Nos Desserts' },
  { id: 'boissons', num: '11', label: 'Boissons' },
];

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';
const U = 'auto=format&fit=crop&w=1200&q=75'; // paramètres Unsplash communs (nets sur écrans 2x/3x)

/* Recettes Tasty Crousty — le client choisit sa version à l'ajout */
const TASTY_RECIPES = [
  { id: 'original', name: 'Original', desc: 'Sauce chili thaï, persil' },
  { id: 'dynamite', name: 'Dynamite', desc: 'Sauce piquante, persil, aneth' },
  { id: 'boursin', name: 'Boursin', desc: 'Sauce boursin, persil, ciboulette' },
  { id: 'dz', name: 'Dz', desc: 'Sauce algérienne, persil' },
];

/* Tailles Tasty Crousty — une seule carte, taille choisie à l'ajout */
const TASTY_SIZES = [
  { id: 'm', label: 'M', price: 7.9 },
  { id: 'l', label: 'L', price: 9.9 },
  { id: 'xl', label: 'XL', price: 10.9 },
];

export const PRODUCTS: Product[] = [
  /* ---------------- 01 · NOS MENUS ---------------- */
  { id: 'tasty-menu', name: 'Menu Tasty Crousty', price: 7.9, cat: 'menus', img: '/photos/tasty-m.jpg', desc: 'Riz thaï, sauce crousty maison, poulet croustillant, onions crispy + 1 boisson 33 cl — taille et recette au choix', incl: { sides: 0, drinks: 1 }, recipes: TASTY_RECIPES, sizes: TASTY_SIZES },

  { id: 'menu-cuisse', name: 'Menu Cuisse', price: 7.5, cat: 'menus', img: `/photos/menu-cuisse.jpg`, desc: '1 cuisse de poulet + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-demi', name: 'Menu Demi Poulet', price: 8.9, cat: 'menus', img: '/photos/menu-demi.jpg', desc: '1 demi poulet + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-hotdog', name: 'Menu Hot Dog', price: 7.5, cat: 'menus', img: '/photos/menu-hotdog.jpg', desc: '1 hot dog + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-pilons', name: 'Menu Pilons', price: 7.5, cat: 'menus', img: `/photos/menu-pilons.jpg`, desc: '3 pilons de poulets + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-wings', name: 'Menu Wings', price: 8.5, cat: 'menus', img: `/photos/menu-wings.jpg`, desc: '6 wings + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-ailes', name: 'Menu Ailes', price: 7.5, cat: 'menus', img: `/photos/menu-ailes.jpg`, desc: '4 ailes de poulets + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-tenders', name: 'Menu Tenders', price: 7.5, cat: 'menus', img: '/photos/menu-tenders.jpg', desc: '3 tenders + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-donuts', name: 'Menu Donut', price: 8.5, cat: 'menus', img: `/photos/menu-donuts.jpg`, desc: '1 donut poulet + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-familial', name: 'Menu Familial', price: 30, cat: 'menus', img: '/photos/menu-familial.jpg', desc: '4 demi-poulets + 4 accompagnements + 1 boisson 1,5 L', incl: { sides: 4, drinks: 1 } },
  { id: 'menu-brick', name: 'Menu Brick', price: 8.5, cat: 'menus', img: `/photos/menu-brick.jpg`, desc: '2 bricks poulet + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'menu-saucisses', name: 'Menu Saucisses', price: 7.5, cat: 'menus', img: '/photos/menu-saucisses.jpg', desc: '2 saucisses + 1 accompagnement + 1 boisson 33 cl', incl: { sides: 1, drinks: 1 } },
  { id: 'sandwich-baguette', name: 'Sandwich Baguette (Poulet Braisé)', price: 7.5, cat: 'sandwichs', img: '/photos/sandwich-baguette.jpg', desc: 'Poulet braisé grillé au feu de bois — servi avec fromage, crudités et une sauce maison' },

  /* ---------------- 02 · NOS TACOS ---------------- */

  /* ---------------- 03 · NOS BURGERS ---------------- */

  /* ---------------- 04 · NOS SANDWICHS ---------------- */

  /* ---------------- 05 · NOS ASSIETTES ---------------- */

  /* ---------------- 06 · NOS SALADES ---------------- */

  /* ---------------- 07 · PIÈCES SÉPARÉES ---------------- */
  { id: 'p-3-pilons', name: '3 Pilons', price: 2.5, cat: 'pieces', img: '/photos/p-3-pilons.jpg', desc: '' },
  { id: 'p-4-ailes', name: '4 Ailes', price: 2.5, cat: 'pieces', img: '/photos/p-4-ailes.jpg', desc: '' },
  { id: 'p-4-nems', name: '4 Nems', price: 5, cat: 'pieces', img: '/photos/p-4-nems.jpg', desc: '' },
  { id: 'p-1-cuisse', name: '1 Cuisse', price: 3.5, cat: 'pieces', img: '/photos/p-1-cuisse.jpg', desc: '' },
  { id: 'p-1-pilon', name: '1 Pilon de Poulet', price: 1, cat: 'pieces', img: '/photos/p-1-pilon.jpg', desc: '' },
  { id: 'p-3-tenders', name: '3 Tenders', price: 2.5, cat: 'pieces', img: '/photos/p-3-tenders.jpg', desc: '' },
  { id: 'p-1-brick', name: '1 Brick', price: 2, cat: 'pieces', img: `/photos/p-1-brick.jpg`, desc: '' },
  { id: 'p-6-wings', name: '6 Wings', price: 4.9, cat: 'pieces', img: '/photos/p-6-wings.jpg', desc: '' },
  { id: 'p-1-saucisse', name: '1 Saucisse', price: 1.5, cat: 'pieces', img: '/photos/p-1-saucisse.jpg', desc: '' },
  { id: 'p-demi-poulet', name: 'Demi Poulet', price: 4.9, cat: 'pieces', img: '/photos/p-demi-poulet.jpg', desc: '' },
  { id: 'p-poulet-entier', name: 'Poulet Entier', price: 8.9, cat: 'pieces', img: `/photos/p-poulet-entier.jpg`, desc: '' },
  { id: 'p-hotdog', name: 'Hot Dog', price: 3.5, cat: 'pieces', img: '/photos/p-hotdog.jpg', desc: '' },
  { id: 'p-donut-poulet', name: '1 Donut de Poulet', price: 2, cat: 'pieces', img: `/photos/p-donut-poulet.jpg`, desc: '' },

  /* ---------------- 08 · NOS ACCOMPAGNEMENTS ---------------- */
  { id: 'a-frites', name: 'Frites', price: 3.5, cat: 'accompagnements', img: `/photos/a-frites.jpg`, desc: '' },
  { id: 'a-potatoes', name: 'Potatoes', price: 3.5, cat: 'accompagnements', img: '/photos/a-potatoes.jpg', desc: '' },
  { id: 'a-plantain', name: 'Banane Plantain', price: 3.5, cat: 'accompagnements', img: `/photos/a-plantain.jpg`, desc: '' },
  { id: 'a-riz-thai', name: 'Riz Thaï', price: 3.5, cat: 'accompagnements', img: `/photos/a-riz-thai.jpg`, desc: '' },
  { id: 'a-pommes-de-terre', name: 'Pommes de Terre', price: 3.5, cat: 'accompagnements', img: `/photos/a-pommes-de-terre.jpg`, desc: '' },
  { id: 'a-pates', name: 'Pâtes', price: 3.5, cat: 'accompagnements', img: '/photos/a-pates.jpg', desc: '' },

  /* ---------------- 09 · NOS SAUCES ---------------- */
  { id: 's-oignons', name: 'Sauce Oignons', price: 0.5, cat: 'sauces', img: `/photos/s-oignons.jpg`, desc: '' },
  { id: 's-verte', name: 'Sauce Verte', price: 0.5, cat: 'sauces', img: `/photos/s-verte.jpg`, desc: '' },

  /* ---------------- 10 · NOS DESSERTS ---------------- */
  { id: 'd-tiramisu', name: 'Tiramisu', price: 3.5, cat: 'desserts', img: `/photos/d-tiramisu.jpg`, desc: '' },
  { id: 'd-tarte-daim', name: 'Tarte au Daim', price: 3.5, cat: 'desserts', img: `/photos/d-tarte-daim.jpg`, desc: '' },

  /* ---------------- 11 · BOISSONS ---------------- */
  { id: 'b-canette', name: 'Canette 33 cl', price: 1.5, cat: 'boissons', img: `/photos/b-canette.jpg`, desc: '' },
  { id: 'b-jus-bissap', name: 'Jus de Bissap', price: 2.5, cat: 'boissons', img: '/photos/b-jus-bissap.jpg', desc: '' },
  { id: 'b-jus-gingembre', name: 'Jus de Gingembre', price: 2.5, cat: 'boissons', img: `/photos/b-jus-gingembre.jpg`, desc: '' },
  { id: 'b-redbull', name: 'Red Bull', price: 2.5, cat: 'boissons', img: `/photos/b-redbull.jpg`, desc: '' },
  { id: 'b-coca-1l5', name: 'Bouteille Coca-Cola 1,5 L', price: 3.5, cat: 'boissons', img: '/photos/b-coca-1l5.jpg', desc: '' },
];
/* ================= FIN DE LA CARTE ================= */

/* Menu par défaut — utilisé tel quel tant que Firebase n'est pas configuré,
   et comme version initiale affichée pendant le chargement Firestore. */
export const DEFAULT_MENU: MenuData = {
  categories: CATEGORIES,
  products: PRODUCTS,
  promos: {},
  promoCodes: [],
  banner: { active: false, text: '' },
  config: { deliveryFee: 2.9, minDelivery: 25, open: true },
  locations: LOCATIONS,
};

/* Compatibilité : l'ancien import CONFIG reste valable */
export const CONFIG = {
  get deliveryFee() { return DEFAULT_MENU.config.deliveryFee; },
  get minDelivery() { return DEFAULT_MENU.config.minDelivery; },
};

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const byIdIn = (menu: MenuData, id: string) => menu.products.find((p) => p.id === id);

/** Préfixe du numéro de commande selon le restaurant (SM-… / PS-…). */
export function orderPrefix(locationId?: string): string {
  if (locationId === 'saint-mard') return 'SM-';
  if (locationId === 'persan') return 'PS-';
  return 'MC-';
}

/* ---------- Numérotation par service (déjeuner / dîner, heure de Paris) ----------
   Les numéros repartent à 1 à chaque service : déjeuner à partir de 10 h,
   dîner à partir de 17 h (les commandes de nuit, avant 5 h, comptent
   dans le dîner de la veille). */

function parisOffsetMs(utcMs: number): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris', hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(utcMs))) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, (+p.hour) % 24, +p.minute, +p.second);
  return asUtc - utcMs;
}

/** Début du service en cours (timestamp UTC en ms) — voir le commentaire ci-dessus. */
export function serviceStart(now = Date.now()): number {
  const offset = parisOffsetMs(now);
  const local = new Date(now + offset);
  const y = local.getUTCFullYear();
  const m = local.getUTCMonth();
  const d = local.getUTCDate();
  const h = local.getUTCHours();
  let startLocal: number;
  if (h < 5) {
    // nuit : toujours le service du soir de la veille
    startLocal = Date.UTC(y, m, d, 17) - 86_400_000;
  } else if (h < 17) {
    startLocal = Date.UTC(y, m, d, 10);
  } else {
    startLocal = Date.UTC(y, m, d, 17);
  }
  // startLocal est en « heure de Paris » → retrancher l'offset (recalculé à cette heure)
  return startLocal - parisOffsetMs(startLocal - offset);
}

/* Applique une promo à un prix de base → prix final arrondi au centime */
export function promoPrice(base: number, promo?: ProductPromo): number {
  if (!promo || !promo.value) return round2(base);
  if (promo.type === 'percent') return round2(base * (1 - clamp(promo.value, 0, 100) / 100));
  if (promo.type === 'amount') return round2(Math.max(0, base - promo.value));
  return round2(Math.max(0, promo.value)); // prix fixe
}

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/* 25 € plutôt que 25,00 € — comme sur le flyer */
export const fmt = (n: number) =>
  (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + '\u00a0€';

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=75';

/* Libellé d'une promo, pour l'admin et les cartes */
export function promoLabel(promo: ProductPromo): string {
  if (promo.type === 'percent') return `-${promo.value}\u00a0%`;
  if (promo.type === 'amount') return `-${fmt(promo.value)}`;
  return fmt(promo.value);
}
