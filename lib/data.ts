/* ================================================================
   ⚠️  DONNÉES À PERSONNALISER — produits, prix ET PHOTOS  ⚠️
   Chaque produit a une propriété « img » (URL Unsplash).
   Pour changer une photo : remplacez simplement l'URL.
   Astuce : cherchez une photo sur unsplash.com, clic droit sur
   l'image → « Copier l'adresse de l'image » → collez-la ici.
   ================================================================ */

export const CONFIG = {
  deliveryFee: 2.9, // ⚠️ ajustez vos frais de livraison réels
  minDelivery: 25, // minimum de commande pour la livraison
};

export type Category = { id: string; num: string; label: string };

export const CATEGORIES: Category[] = [
  { id: 'menus', num: '01', label: 'Les Menus' },
  { id: 'poulet', num: '02', label: 'Poulet & Grillades' },
  { id: 'accomp', num: '03', label: 'Accompagnements' },
  { id: 'sauces', num: '04', label: 'Sauces Maison' },
  { id: 'boissons', num: '05', label: 'Desserts & Boissons' },
];

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
  { id: 'menu-solo', name: 'Menu Solo', price: 9.5, cat: 'menus', popular: true, img: `https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?${U}`, desc: 'Quart de poulet mijoté, frites maison, sauce au choix, boisson 33 cl.' },
  { id: 'menu-duo', name: 'Menu Duo', price: 17.9, cat: 'menus', img: `https://images.unsplash.com/photo-1608039755401-742074f0548d?${U}`, desc: 'Demi poulet + 2 pilons, grandes frites, 2 sauces, 2 boissons.' },
  { id: 'menu-familial', name: 'Menu Familial', price: 29.9, cat: 'menus', popular: true, img: `https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?${U}`, desc: 'Poulet entier, 6 pilons, grand plateau de frites, 4 sauces, 4 boissons.' },
  { id: 'p-pilons', name: '3 Pilons Mijotés', price: 2.5, cat: 'poulet', popular: true, img: `https://images.unsplash.com/photo-1562967914-608f82629710?${U}`, desc: "Nos pilons marinés 24h, mijotés lentement jusqu'à la chair fondante." },
  { id: 'p-saucisse', name: 'Saucisse Grillée', price: 1.5, cat: 'poulet', popular: true, img: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?${U}`, desc: 'Saucisse grillée à la braise, à croquer sans modération.' },
  { id: 'p-quart', name: 'Quart de Poulet', price: 4.5, cat: 'poulet', img: `https://images.unsplash.com/photo-1610614819513-58e34989848b?${U}`, desc: 'Un quart généreux de notre poulet mijoté du jour.' },
  { id: 'p-demi', name: 'Demi Poulet', price: 8.0, cat: 'poulet', img: `https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?${U}`, desc: 'Demi poulet entier, doré et moelleux, mariné 24h.' },
  { id: 'p-entier', name: 'Poulet Entier', price: 14.0, cat: 'poulet', img: `https://images.unsplash.com/photo-1532550907401-a500c9a57435?${U}`, desc: 'Le poulet complet de la maison, pour les grandes faims.' },
  { id: 'a-frites', name: 'Frites Maison', price: 3.0, cat: 'accomp', popular: true, img: `https://images.unsplash.com/photo-1573080496219-bb080dd4f877?${U}`, desc: 'Coupées et cuites maison, tous les jours. Jamais de congelé.' },
  { id: 'a-grandes', name: 'Grandes Frites', price: 4.5, cat: 'accomp', img: `https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?${U}`, desc: 'La version familiale de nos frites fraîches.' },
  { id: 'a-riz', name: 'Riz Parfumé', price: 3.0, cat: 'accomp', img: `https://images.unsplash.com/photo-1512058564366-18510be2db19?${U}`, desc: 'Un accompagnement doux et parfumé, parfait avec la sauce.' },
  { id: 's-verte', name: 'Sauce Verte', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?${U}`, desc: 'La fameuse verte, préparée maison chaque matin.' },
  { id: 's-samourai', name: 'Sauce Samouraï', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1596040033229-a9821ebd058d?${U}`, desc: 'Piquante et crémeuse, la préférée des habitués.' },
  { id: 's-algerienne', name: 'Sauce Algérienne', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1472476443507-c7a5948772fc?${U}`, desc: 'Douce et légèrement relevée, la valeur sûre.' },
  { id: 's-blanche', name: 'Sauce Blanche', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1547592166-23ac45744acd?${U}`, desc: 'Fraîche et onctueuse, à tomber sur les frites.' },
  { id: 's-andalouse', name: 'Sauce Andalouse', price: 0.5, cat: 'sauces', img: `https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?${U}`, desc: 'La touche ensoleillée et parfumée de la maison.' },
  { id: 'b-coca', name: 'Coca-Cola 33cl', price: 2.0, cat: 'boissons', img: `https://images.unsplash.com/photo-1554866585-cd94860890b7?${U}`, desc: 'Bien frais, comme il faut.' },
  { id: 'b-fanta', name: 'Fanta 33cl', price: 2.0, cat: 'boissons', img: `https://images.unsplash.com/photo-1437418747212-8d9709afab22?${U}`, desc: "L'agrume qui accompagne le poulet." },
  { id: 'b-eau', name: 'Eau Minérale 50cl', price: 1.5, cat: 'boissons', img: `https://images.unsplash.com/photo-1548839140-29a749e1cf4d?${U}`, desc: 'Pour rester léger.' },
  { id: 'b-tiramisu', name: 'Tiramisu Maison', price: 3.0, cat: 'boissons', img: `https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?${U}`, desc: 'Préparé maison, crémeux à souhait.' },
];
/* ================= FIN DES DONNÉES ================= */

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);

export const fmt = (n: number) => n.toFixed(2).replace('.', ',') + '\u00a0€';

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70';
