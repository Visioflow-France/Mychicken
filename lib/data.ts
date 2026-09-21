/* ================================================================
   LA CARTE — My Chicken
   Transcrite fidèlement du flyer officiel (sept. 2026).
   Sections, plats, contenus et prix = exactement ceux du menu.
   Pour changer un prix ou un plat : modifiez simplement la ligne.
   ================================================================ */

export const CONFIG = {
  deliveryFee: 2.9, // frais de livraison
  minDelivery: 25, // livraison à partir de 25 € d'achat (cf. flyer)
};

export type Category = { id: string; num: string; label: string };

export const CATEGORIES: Category[] = [
  { id: 'menus', num: '01', label: 'Nos Menus' },
  { id: 'tacos', num: '02', label: 'Nos Tacos' },
  { id: 'burgers', num: '03', label: 'Nos Burgers' },
  { id: 'sandwichs', num: '04', label: 'Nos Sandwichs' },
  { id: 'assiettes', num: '05', label: 'Nos Assiettes' },
  { id: 'salades', num: '06', label: 'Nos Salades' },
  { id: 'pieces', num: '07', label: 'Pièces Séparées' },
  { id: 'accompagnements', num: '08', label: 'Nos Accompagnements' },
  { id: 'sauces', num: '09', label: 'Nos Sauces' },
  { id: 'boissons', num: '10', label: 'Boissons' },
];

const F = 'https://image-search-mcp-cn-beijing.oss-cn-beijing.aliyuncs.com/image-search-mcp/images-ppt/';
const U = 'auto=format&fit=crop&w=800&q=70'; // paramètres Unsplash communs

export type Product = {
  id: string;
  name: string;
  price: number;
  cat: string;
  popular?: boolean;
  img: string;
  desc: string;
};

export const PRODUCTS: Product[] = [
  /* ---------------- 01 · NOS MENUS ---------------- */
  { id: 'menu-cuisse', name: 'Menu Cuisse', price: 7.5, cat: 'menus', popular: true, img: `${F}5b77e643d097.jpg`, desc: '1 cuisse de poulet + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-demi', name: 'Menu Demi Poulet', price: 8.9, cat: 'menus', popular: true, img: `${F}45dd2550dad9.jpg`, desc: '1 demi poulet + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-hotdog', name: 'Menu Hot Dog', price: 7.5, cat: 'menus', img: `${F}5f0ee3b5d64a.jpg`, desc: '1 hot dog + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-pilons', name: 'Menu Pilons', price: 7.5, cat: 'menus', img: `${F}f72a1ab6d609.jpg`, desc: '3 pilons de poulets + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-wings', name: 'Menu Wings', price: 8.5, cat: 'menus', img: `${F}030c7cfcd6bc.jpg`, desc: '6 wings + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-ailes', name: 'Menu Ailes', price: 7.5, cat: 'menus', img: `${F}21181d899cf9.jpg`, desc: '4 ailes de poulets + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-tenders', name: 'Menu Tenders', price: 7.5, cat: 'menus', img: `${F}4c5945eff50c.jpg`, desc: '3 tenders + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-donuts', name: 'Menu Donuts', price: 8.5, cat: 'menus', img: `${F}c917ff812687.jpg`, desc: '2 donuts poulet + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-mixte', name: 'Menu Mixte', price: 10.5, cat: 'menus', img: `${F}7d24cd680344.jpg`, desc: '1 cuisse + 2 pilons + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-filet', name: 'Menu Filet', price: 7.9, cat: 'menus', img: `${F}9b58d0eb71ca.jpg`, desc: '1 filet de poulet + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-tiers', name: 'Menu Tiers de Poulet', price: 10.9, cat: 'menus', img: `${F}e4148192fba9.jpg`, desc: '1 tiers de poulet + 1 accompagnement + 1 boisson 33 cl' },
  { id: 'menu-familial', name: 'Menu Familial', price: 25, cat: 'menus', img: `${F}a1fc59d6204b.jpg`, desc: '2 demi-poulets + 2 accompagnements + 1 boisson 1,5 L' },
  { id: 'menu-special', name: 'Menu Spécial', price: 25, cat: 'menus', popular: true, img: `${F}02f572b69cfe.jpg`, desc: '1 poulet entier braisé + 2 accompagnements + 1 boisson 1,5 L' },
  { id: 'sandwich-baguette', name: 'Sandwich Baguette', price: 7.5, cat: 'menus', img: `${F}08e205722e55.jpg`, desc: 'Servi avec fromage, crudités et une sauce maison. Au choix : chicken braisé, merguez ou kefta. Grillé au feu de bois.' },

  /* ---------------- 02 · NOS TACOS ---------------- */
  { id: 'tacos-m', name: 'Tacos M', price: 7, cat: 'tacos', popular: true, img: `${F}25dc9eb36338.png`, desc: 'Galette, viande au choix, frites, sauce — suppl. viande + 2,50 €' },
  { id: 'tacos-l', name: 'Tacos L', price: 8, cat: 'tacos', img: `${F}c935735abfc7.jpeg`, desc: 'Galette, viande au choix, frites, sauce — suppl. viande + 2,50 €' },
  { id: 'tacos-xl', name: 'Tacos XL', price: 9, cat: 'tacos', img: `${F}25dc9eb36338.png`, desc: 'Galette, viande au choix, frites, sauce — suppl. viande + 2,50 €' },

  /* ---------------- 03 · NOS BURGERS ---------------- */
  { id: 'burger-classique', name: 'Classique', price: 4.5, cat: 'burgers', img: `${F}df75c8a20b4b.jpg`, desc: '' },
  { id: 'menu-burger', name: 'Menu Burger', price: 7.5, cat: 'burgers', img: `${F}9bc77e680d44.jpg`, desc: 'Burger + frites + boisson 33 cl' },

  /* ---------------- 04 · NOS SANDWICHS ---------------- */
  { id: 'sandwich-poulet', name: 'Sandwich Poulet', price: 5, cat: 'sandwichs', img: `${F}8cade619e2fd.jpg`, desc: '' },
  { id: 'menu-sandwich', name: 'Menu Sandwich', price: 7.5, cat: 'sandwichs', img: `${F}8cade619e2fd.jpg`, desc: 'Sandwich + frites + boisson 33 cl' },

  /* ---------------- 05 · NOS ASSIETTES ---------------- */
  { id: 'assiette-poulet', name: 'Assiette Poulet', price: 8, cat: 'assiettes', img: `${F}c157ab0a8feb.jpg`, desc: 'Poulet braisé + accompagnement + sauce + pain' },
  { id: 'assiette-mixte', name: 'Assiette Mixte', price: 8.5, cat: 'assiettes', img: `${F}94eebb28a234.png`, desc: 'Cuisse + pilons + accompagnement + sauce' },

  /* ---------------- 06 · NOS SALADES ---------------- */
  { id: 'salade-iranienne', name: 'Salade Iranienne', price: 6.5, cat: 'salades', img: `${F}47d22a191135.jpg`, desc: '' },
  { id: 'salade-bulgour', name: 'Salade Bulgour', price: 7, cat: 'salades', img: `${F}704105884000.jpg`, desc: '' },

  /* ---------------- 07 · PIÈCES SÉPARÉES ---------------- */
  { id: 'p-3-pilons', name: '3 Pilons', price: 2.5, cat: 'pieces', img: `${F}f72a1ab6d609.jpg`, desc: '' },
  { id: 'p-4-ailes', name: '4 Ailes', price: 2.5, cat: 'pieces', img: `${F}21181d899cf9.jpg`, desc: '' },
  { id: 'p-4-nems', name: '4 Nems', price: 5, cat: 'pieces', img: `${F}7cf36fb52134.jpg`, desc: '' },
  { id: 'p-1-cuisse', name: '1 Cuisse', price: 3.5, cat: 'pieces', img: `${F}5b77e643d097.jpg`, desc: '' },
  { id: 'p-1-pilon', name: '1 Pilon de Poulet', price: 1, cat: 'pieces', img: `${F}f72a1ab6d609.jpg`, desc: '' },
  { id: 'p-3-tenders', name: '3 Tenders', price: 3.5, cat: 'pieces', img: `${F}4c5945eff50c.jpg`, desc: '' },
  { id: 'p-1-brick', name: '1 Brick', price: 2.5, cat: 'pieces', img: `${F}853664036f2c.jpeg`, desc: '' },
  { id: 'p-6-wings', name: '6 Wings', price: 4.9, cat: 'pieces', img: `${F}030c7cfcd6bc.jpg`, desc: '' },
  { id: 'p-1-saucisse', name: '1 Saucisse', price: 2, cat: 'pieces', img: `${F}0d66b6622167.jpg`, desc: '' },
  { id: 'p-demi-poulet', name: 'Demi Poulet', price: 4.9, cat: 'pieces', img: `${F}45dd2550dad9.jpg`, desc: '' },
  { id: 'p-poulet-entier', name: 'Poulet Entier', price: 9.9, cat: 'pieces', img: `${F}02f572b69cfe.jpg`, desc: '' },
  { id: 'p-hotdog', name: 'Hot Dog', price: 3.5, cat: 'pieces', img: `${F}5f0ee3b5d64a.jpg`, desc: '' },
  { id: 'p-donut-poulet', name: '1 Donut de Poulet', price: 3.5, cat: 'pieces', img: `${F}c917ff812687.jpg`, desc: '' },

  /* ---------------- 08 · NOS ACCOMPAGNEMENTS ---------------- */
  { id: 'a-frites', name: 'Frites', price: 2.5, cat: 'accompagnements', img: `https://images.unsplash.com/photo-1573080496219-bb080dd4f877?${U}`, desc: '' },
  { id: 'a-potatoes', name: 'Potatoes', price: 2.5, cat: 'accompagnements', img: `${F}2180184ecd88.jpg`, desc: '' },
  { id: 'a-mozzarella', name: 'Mozzarella Sticks', price: 3.5, cat: 'accompagnements', img: `${F}d77dc331b647.png`, desc: '' },
  { id: 'a-plantain', name: 'Banane Plantain', price: 2, cat: 'accompagnements', img: `${F}6a6c25ff8af2.jpg`, desc: '' },
  { id: 'a-riz-thai', name: 'Riz Thaï', price: 2, cat: 'accompagnements', img: `https://images.unsplash.com/photo-1512058564366-18510be2db19?${U}`, desc: '' },
  { id: 'a-salade-verte', name: 'Salade Verte', price: 2, cat: 'accompagnements', img: `${F}cc3feac5ad2c.jpg`, desc: '' },
  { id: 'a-oignons', name: 'Oignons', price: 2, cat: 'accompagnements', img: `${F}0319b8a7dabe.png`, desc: '' },
  { id: 'a-pommes-de-terre', name: 'Pommes de Terre', price: 2, cat: 'accompagnements', img: `${F}cf3588cc2c1b.jpg`, desc: '' },
  { id: 'a-pates', name: 'Pâtes', price: 2, cat: 'accompagnements', img: `${F}0f59d4aa56cb.jpg`, desc: '' },

  /* ---------------- 09 · NOS SAUCES ---------------- */
  { id: 's-algerienne', name: 'Sauce Algérienne', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1472476443507-c7a5948772fc?${U}`, desc: '' },
  { id: 's-samourai', name: 'Sauce Samouraï', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?${U}`, desc: '' },
  { id: 's-blanche', name: 'Sauce Blanche', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1547592166-23ac45744acd?${U}`, desc: '' },
  { id: 's-biggy', name: 'Sauce Biggy Burger', price: 0.5, cat: 'sauces', img: `${F}f1d806cb94df.jpg`, desc: '' },
  { id: 's-chili', name: 'Chili', price: 0.5, cat: 'sauces', img: `${F}a9500ac79e37.jpg`, desc: '' },
  { id: 's-ketchup', name: 'Ketchup', price: 0.5, cat: 'sauces', img: `${F}779a3bad3cc8.jpg`, desc: '' },
  { id: 's-mayonnaise', name: 'Mayonnaise', price: 0.5, cat: 'sauces', img: `${F}1ea6d6a4cd39.jpg`, desc: '' },

  /* ---------------- 10 · BOISSONS ---------------- */
  { id: 'b-33cl', name: 'Boissons 33 cl', price: 1, cat: 'boissons', img: `https://images.unsplash.com/photo-1554866585-cd94860890b7?${U}`, desc: '' },
  { id: 'b-1l5', name: 'Boissons 1,5 L', price: 2, cat: 'boissons', img: `${F}40d8249bad00.jpg`, desc: '' },
  { id: 'b-eau', name: 'Eau 33 cl', price: 1, cat: 'boissons', img: `https://images.unsplash.com/photo-1548839140-29a749e1cf4d?${U}`, desc: '' },
];
/* ================= FIN DE LA CARTE ================= */

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);

/* 25 € plutôt que 25,00 € — comme sur le flyer */
export const fmt = (n: number) =>
  (Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',')) + '\u00a0€';

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70';
