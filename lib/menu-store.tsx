'use client';

/* ================================================================
   MenuProvider — la carte pour tout le site, OPTIMISÉ QUOTA SPARK.
   • Firebase configuré → UNE SEULE lecture Firestore par visite :
     le menu complet (produits, catégories, promos, réglages,
     restaurants) vit dans le document unique « menu/published ».
     Résultat mis en cache par onglet (sessionStorage) → navigation
     dans le site = 0 lecture supplémentaire.
     Exception : dans le DASHBOARD (/admin…), la carte est suivie en
     direct (onSnapshot) — une publication depuis un autre appareil
     s'affiche sans recharger. Le site client, lui, ne fait qu'une
     lecture par visite (événement MENU_UPDATED_EVENT en plus après
     une publication admin réussie).
   • Firebase absent → MODE DÉMO : overrides dans le localStorage
     (clé mc_menu_overrides), synchronisés entre onglets.
   • En cas d'erreur réseau → valeurs embarquées de lib/data.ts.
   ================================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import {
  DEFAULT_MENU,
  promoPrice,
  type MenuData,
  type Product,
  type ProductPromo,
  type PromoCode,
} from './data';
import { firebaseEnabled, getClientDb, PUBLISHED_DOC } from './firebase';

export type LivePrice = { price: number; oldPrice: number | null; promo?: ProductPromo };

type MenuContextValue = {
  menu: MenuData;
  source: 'firebase' | 'demo';
  /** Prix effectif d'un produit (promo appliquée) */
  effective: (p: Product) => LivePrice;
  priceOf: (id: string) => LivePrice;
  findCode: (code: string) => PromoCode | undefined;
};

const MenuContext = createContext<MenuContextValue | null>(null);

/* ---------- Mode démo : overrides locaux + events ---------- */

export const LOCAL_MENU_KEY = 'mc_menu_overrides';
export const MENU_UPDATED_EVENT = 'mc-menu-updated';

/* Cache session du menu publié : la visite complète ne coûte qu'1 lecture */
const MENU_CACHE_KEY = 'mc_menu_cache';
const MENU_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function readLocalMenu(): MenuData | null {
  try {
    const raw = localStorage.getItem(LOCAL_MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MenuData;
    if (!Array.isArray(parsed.products) || !Array.isArray(parsed.categories)) return null;
    return { ...DEFAULT_MENU, ...parsed, config: { ...DEFAULT_MENU.config, ...parsed.config }, banner: { ...DEFAULT_MENU.banner, ...parsed.banner } };
  } catch {
    return null;
  }
}

export function writeLocalMenu(menu: MenuData) {
  localStorage.setItem(LOCAL_MENU_KEY, JSON.stringify(menu));
  window.dispatchEvent(new CustomEvent(MENU_UPDATED_EVENT));
}

export function clearLocalMenu() {
  localStorage.removeItem(LOCAL_MENU_KEY);
  window.dispatchEvent(new CustomEvent(MENU_UPDATED_EVENT));
}

/* Rafraîchit le menu publié (1 lecture) et vide le cache — appelé
   après une publication admin réussie. */
export function refreshPublishedMenu() {
  try {
    sessionStorage.removeItem(MENU_CACHE_KEY);
  } catch {
    /* session indisponible */
  }
  window.dispatchEvent(new CustomEvent(MENU_UPDATED_EVENT));
}

function readCache(): MenuData | null {
  try {
    const raw = sessionStorage.getItem(MENU_CACHE_KEY);
    if (!raw) return null;
    const { at, menu } = JSON.parse(raw) as { at: number; menu: MenuData };
    if (!at || Date.now() - at > MENU_CACHE_TTL || !Array.isArray(menu?.products)) return null;
    return { ...DEFAULT_MENU, ...menu };
  } catch {
    return null;
  }
}

function writeCache(menu: MenuData) {
  try {
    sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify({ at: Date.now(), menu }));
  } catch {
    /* quota session — on vit sans cache */
  }
}

/* Fusion du menu publié avec les valeurs embarquées (champs manquants). */
function mergePublished(d: Partial<MenuData>): MenuData {
  return {
    ...DEFAULT_MENU,
    products: d.products || DEFAULT_MENU.products,
    categories: d.categories || DEFAULT_MENU.categories,
    promos: d.promos || {},
    promoCodes: d.promoCodes || [],
    config: { ...DEFAULT_MENU.config, ...d.config },
    banner: { ...DEFAULT_MENU.banner, ...d.banner },
    locations: d.locations || DEFAULT_MENU.locations,
  };
}

/* ---------- Provider ---------- */

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU);
  const source: 'firebase' | 'demo' = firebaseEnabled ? 'firebase' : 'demo';

  useEffect(() => {
    if (!firebaseEnabled) {
      // MODE DÉMO — écoute le localStorage (autres onglets + même onglet)
      const sync = () => setMenu(readLocalMenu() || DEFAULT_MENU);
      sync();
      window.addEventListener('storage', sync);
      window.addEventListener(MENU_UPDATED_EVENT, sync);
      return () => {
        window.removeEventListener('storage', sync);
        window.removeEventListener(MENU_UPDATED_EVENT, sync);
      };
    }

    // MODE FIREBASE — UNE lecture unique du document menu/published
    const db = getClientDb();
    if (!db) return;

    /* DASHBOARD (/admin…) : carte en DIRECT via onSnapshot — une publication
       depuis un AUTRE appareil apparaît sans recharger (le dashboard reste
       ouvert au comptoir toute la journée). Le site client garde sa lecture
       unique + cache session (quota Spark). */
    if (window.location.pathname.startsWith('/admin')) {
      const unsub = onSnapshot(
        doc(db, PUBLISHED_DOC),
        (snap) => {
          const d = snap.data() as Partial<MenuData> | undefined;
          if (d && Array.isArray(d.products) && d.products.length) setMenu(mergePublished(d));
          else setMenu(DEFAULT_MENU);
        },
        (e) => console.error('[menu] suivi direct impossible, menu embarqué utilisé :', e)
      );
      return () => unsub();
    }

    let cancelled = false;
    const load = async () => {
      const cached = readCache();
      if (cached) {
        if (!cancelled) setMenu(cached);
        return;
      }
      try {
        const snap = await getDoc(doc(db, PUBLISHED_DOC));
        if (cancelled) return;
        const d = snap.data() as Partial<MenuData> | undefined;
        if (d && Array.isArray(d.products) && d.products.length) {
          const merged = mergePublished(d);
          setMenu(merged);
          writeCache(merged);
        } else {
          // Doc jamais publié : valeurs embarquées du flyer
          setMenu(DEFAULT_MENU);
        }
      } catch (e) {
        // Erreur réseau temporaire → fallback embarqué, aucune boucle
        console.error('[menu] lecture impossible, menu embarqué utilisé :', e);
      }
    };
    load();

    // Rafraîchissement ponctuel (publication admin) — 1 re-lecture max
    const onRefresh = () => load();
    window.addEventListener(MENU_UPDATED_EVENT, onRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener(MENU_UPDATED_EVENT, onRefresh);
    };
  }, []);

  const effective = useCallback(
    (p: Product): LivePrice => {
      const promo = menu.promos[p.id];
      const final = promoPrice(p.price, promo);
      return { price: final, oldPrice: promo && final !== p.price ? p.price : null, promo };
    },
    [menu.promos]
  );

  const priceOf = useCallback(
    (id: string): LivePrice => {
      const p = menu.products.find((x) => x.id === id);
      if (!p) return { price: 0, oldPrice: null };
      return effective(p);
    },
    [menu.products, effective]
  );

  const findCode = useCallback(
    (code: string): PromoCode | undefined =>
      menu.promoCodes.find((c) => c.active && c.code === code.trim().toUpperCase()),
    [menu.promoCodes]
  );

  const value = useMemo<MenuContextValue>(
    () => ({ menu, source, effective, priceOf, findCode }),
    [menu, source, effective, priceOf, findCode]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu doit être utilisé dans un <MenuProvider>');
  return ctx;
}

/* ---------- Hook utilitaire : catégories réordonnées selon config ---------- */

export function useCategoriesWithProducts() {
  const { menu } = useMenu();
  return useMemo(
    () => menu.categories.map((c) => ({ ...c, products: menu.products.filter((p) => p.cat === c.id) })),
    [menu.categories, menu.products]
  );
}
