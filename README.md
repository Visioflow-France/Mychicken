# 🍗 My CHICKEN — Site vitrine en Next.js

Version Next.js (App Router + TypeScript) du site du restaurant **My CHICKEN** à Persan.
Design, textes, panier et animations : identiques à la version HTML d'origine.

## Lancer le projet

```bash
npm install     # installer les dépendances (une seule fois)
npm run dev     # serveur de développement → http://localhost:3000
```

## Mettre en production

```bash
npm run build   # crée la version optimisée
npm run start   # sert la version de production
```

Le plus simple pour héberger : pousser le dossier sur GitHub puis importer le projet
sur [vercel.com](https://vercel.com) — zéro configuration nécessaire.

## Structure du projet

```
app/
  layout.tsx      → enveloppe du site (polices, métadonnées SEO, providers)
  page.tsx        → page unique, assemble toutes les sections
  globals.css     → tout le design (couleurs, cartes, animations…)
  icon.svg        → favicon 🍗
lib/
  data.ts         → ⚠️ PRODUITS, PRIX, PHOTOS, frais de livraison (à personnaliser ici)
  cart.tsx        → panier partagé (localStorage, comme l'original)
  toast.tsx       → notifications « ✓ ajouté au panier »
components/
  Navbar.tsx      → navigation fixe + menu mobile + badge panier + scrollspy
  Hero.tsx        → bannière + braises animées (canvas) + bandeau défilant
  Featured.tsx    → best-sellers
  InfoBand.tsx    → infos pratiques (livraison, adresse, téléphone)
  Values.tsx      → les 4 engagements
  MenuSection.tsx → la carte : menus signature + catégories
  Story.tsx       → notre histoire
  Contact.tsx     → formulaire + carte Google Maps
  CartSection.tsx → panier + commande (emporter / sur place / livraison)
  Footer.tsx      → pied de page
  ProductCard.tsx → carte produit réutilisée partout
  Reveal.tsx      → animation d'apparition au scroll
  SmartImg.tsx    → image avec photo de secours si Unsplash ne répond pas
```

## Personnaliser

| Quoi                        | Où                                     |
| --------------------------- | -------------------------------------- |
| Produits, prix, photos      | `lib/data.ts` (tableau `PRODUCTS`)     |
| Frais de livraison, minimum | `lib/data.ts` (constante `CONFIG`)     |
| Couleurs, styles            | `app/globals.css` (variables en tête)  |
| Textes des sections         | le composant correspondant dans `components/` |

## Notes techniques

- Le panier est stocké dans le navigateur (`localStorage`, clé `mc_cart_v2`) —
  aucune donnée n'est envoyée à un serveur, comme sur la version d'origine.
- Les polices (Cormorant Garamond + Montserrat) sont chargées via `next/font`
  (automatiquement optimisées, sans requête vers Google Fonts côté client).
- Les photos viennent d'Unsplash ; si une photo ne charge pas, une image de
  secours s'affiche automatiquement.
