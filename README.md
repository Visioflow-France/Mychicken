# 🍗 My CHICKEN — Site vitrine + Dashboard admin + Paiement

Version Next.js (App Router + TypeScript) du site du restaurant **My CHICKEN** à Persan,
avec **dashboard admin temps réel** (carte, promos, commandes) et **paiement en ligne Stripe**.

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

## 🚀 Nouveautés

### 1. Dashboard admin — `/admin`

**Connexion : Firebase Auth** (e-mail + mot de passe du patron — voir
« Brancher Firebase » ci-dessous ; `ADMIN_EMAILS` contrôle qui a accès).
Sans Firebase configuré, un mot de passe partagé fait office (mode démo).

- **Carte** : créer / modifier / supprimer des produits (nom, prix, photo, description,
  best-seller, épuisé), tri par catégories, recherche
- **Catégories** : renommer, réordonner, ajouter, supprimer
- **Promos** : promos par produit (− %, − € ou nouveau prix), **codes promo panier**,
  **bandeau promo** affiché en direct en haut du site
- **Commandes** : arrivée en temps réel, statuts (nouvelle → en préparation → prête →
  terminée), suivi des paiements, chiffre d'affaires
- **Réglages** : restaurant ouvert/fermé, frais de livraison, minimum de commande

**Un seul dashboard pour les deux restaurants** : un sélecteur Persan ↔ Saint-Mard
en haut à droite (les données sont filtrées par restaurant). En plus,
`/admin/persan` et `/admin/saint-mard` sont des **PWA installables séparées**
(« MC Persan », « MC Saint-Mard ») qui s'ouvrent directement sur leur restaurant —
idéal pour un gérant qui ne doit voir que le sien.

Le bouton **« Publier en direct »** pousse les modifications : tous les visiteurs voient
la carte se mettre à jour **instantanément**, sans recharger la page.

> **Mode démo** : tant que Firebase n'est pas configuré, les modifications sont
> enregistrées dans le navigateur (visible entre onglets du même navigateur, pratique
> pour tester : ouvrez `/admin` d'un côté, `/la-carte` de l'autre).

### 2. Paiement en ligne (Stripe)

Au moment de commander, le client choisit **carte bancaire** (page de paiement
sécurisée Stripe, CB / Visa / Mastercard) ou **par téléphone**.
Tant que `STRIPE_SECRET_KEY` n'est pas définie, seule l'option téléphone est proposée.

## ⚙️ Brancher Firebase (5 minutes)

1. [console.firebase.google.com](https://console.firebase.google.com) → créer un projet
2. **Build → Firestore Database** → créer la base (mode production)
3. **Build → Authentication → Sign-in method** → activer **Email/Password**,
   puis **Users → Add user** : créer le compte du patron (e-mail + mot de passe)
4. **Paramètres du projet → Vos applications → Web** : copier la config dans `.env.local`
   (les 6 variables `NEXT_PUBLIC_FIREBASE_*`)
5. **Paramètres → Comptes de service → Générer une clé privée** : coller tout le JSON
   dans `FIREBASE_SERVICE_ACCOUNT=` (sur une seule ligne)
6. **`.env.local`** : `ADMIN_EMAILS=le-mail-du-patron` (plusieurs e-mails séparés par
   des virgules). Le patron se connecte ensuite à `/admin` avec son compte ; les
   autres comptes Firebase, même s'ils existent, sont refusés.
7. **Règles Firestore** (onglet Règles) :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /menu/{doc}   { allow read: if true; allow write: if false; }
    match /orders/{id}  { allow read: if true; allow write: if false; }
  }
}
```

> Les écritures passent uniquement par le serveur (SDK Admin) — les clients ne peuvent
> que lire. Redéployez : la carte publiée depuis `/admin` est visible par tout le monde
> en temps réel, et les commandes arrivent dans l'onglet Commandes.

## ⚙️ Brancher Stripe + Stripe Connect

Ton compte Stripe est la **plateforme** ; chaque restaurant a **son propre compte
Stripe Connect Standard** rattaché : le client paie via ta plateforme, l'argent est
encaissé **directement sur le compte du restaurant**, qui reçoit ses virements et
voit ses paiements dans **son** dashboard Stripe.

1. [dashboard.stripe.com](https://dashboard.stripe.com) → **Développeurs → Clés API** :
   `STRIPE_SECRET_KEY` dans `.env.local`
2. **Créer les comptes connectés des deux restaurants** (une fois) :
   ```bash
   npm run stripe:connect -- create persan mail-du-patron@…
   npm run stripe:connect -- create saint-mard mail-du-patron@…
   ```
   Le script affiche un **lien d'onboarding** à ouvrir avec le patron : il crée (ou
   relie) son compte Stripe et complète ses infos (SIRET, IBAN, dirigeant…).
   Reporter ensuite les `acct_…` dans `.env.local` :
   `STRIPE_CONNECT_ACCOUNT_PERSAN` / `STRIPE_CONNECT_ACCOUNT_SAINT_MARD`.
   Vérifier l'avancement : `npm run stripe:connect -- status`.
3. **Webhooks → Ajouter un endpoint** : `https://votre-domaine/api/webhooks/stripe`,
   événement `checkout.session.completed` — **cocher « Les comptes connectés »**
   (les paiements ont lieu sur les comptes des restaurants, la plateforme ne reçoit
   ces événements qu'en mode Connect) → `STRIPE_WEBHOOK_SECRET`

Les prix sont **toujours recalculés côté serveur** depuis la carte : impossible de
manipuler un montant depuis le navigateur.

## Structure du projet

```
app/
  page.tsx / la-carte / commander / contact / notre-histoire   → pages publiques
  admin/          → dashboard admin (login, onglets, styles)
  api/
    admin/…       → auth, publication du menu, statut commandes (protégées par cookie)
    checkout/     → création de session Stripe Checkout + vérification paiement
    orders/       → commande « par téléphone »
    webhooks/…    → confirmation automatique des paiements Stripe
    config/       → état du système (affiché dans /admin → Réglages)
lib/
  data.ts         → types + carte par défaut (valeurs du flyer)
  firebase.ts     → Firebase client (lecture temps réel)
  server/         → Firebase Admin + auth admin (côté serveur uniquement)
  menu-store.tsx  → MenuProvider : la carte live pour tout le site
  cart.tsx        → panier (prix temps réel)
  orders-store.tsx→ commandes temps réel pour le dashboard
  admin-client.ts → écritures du dashboard (API ou localStorage en démo)
components/       → composants du site + components/admin/ (dashboard)
```

## Notes techniques

- Sans Firebase ni Stripe, le site fonctionne exactement comme avant (carte du flyer,
  commande par téléphone) — chaque brique s'active quand sa config arrive.
- Le panier reste dans le navigateur (`localStorage`, clé `mc_cart_v2`).
- Les polices (Cormorant Garamond + Montserrat) sont chargées via `next/font`.
- Sécurité : écritures Firestore réservées au serveur, connexion dashboard par compte
  Firebase vérifié côté serveur + liste blanche `ADMIN_EMAILS`, montants Stripe
  recalculés serveur.

## Déploiement Cloudflare

Le site est adapté pour **Cloudflare Workers** via OpenNext (`@opennextjs/cloudflare`).
Le serveur n'utilise PAS `firebase-admin` (interdit sur Workers à cause de protobufjs) :
Firestore est appelé via l'API REST (`lib/server/firestore-rest.ts`), signé avec la clé
de service — ça marche à la fois en local et sur Workers.

```bash
npm run preview   # build Worker + test local (http://localhost:8787)
npm run deploy    # build + déploiement sur Cloudflare
```

Première fois : `npx wrangler login` (ouvre le navigateur pour connecter ton compte).

Variables à définir sur Cloudflare (dashboard → Workers → my-chicken → Settings →
Variables, ou `npx wrangler secret put NOM`) : celles de `.env.local`
(ADMIN_EMAILS, ADMIN_SECRET, NEXT_PUBLIC_FIREBASE_*, FIREBASE_SERVICE_ACCOUNT,
STRIPE_*…).

Après le déploiement, mettre `NEXT_PUBLIC_SITE_URL=https://ton-domaine` et, dans le
dashboard Stripe, pointer le webhook vers `https://ton-domaine/api/webhooks/stripe`.
