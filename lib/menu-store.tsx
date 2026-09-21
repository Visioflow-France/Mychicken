'use client';

/* ================================================================
   MenuProvider — la carte EN TEMPS RÉEL pour tout le site.

   • Firebase configuré → abonnements onSnapshot Firestore : chaque
     modification publiée depuis /admin apparaît instantanément chez
     tous les visiteurs (prix, promos, produits épuisés, bandeau…).
   • Sinon → MODE DÉMO : les modifications faites dans /admin sont
     enregistrées dans le localStorage (clé mc_menu_overrides) et
     synchronisées entre les onglets ouverts du même navigateur.
     Pratique pour tester le dashboard en attendant Firebase.
   ================================================================ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  DEFAULT_MENU,
  promoPrice,
  type MenuData,
  type Product,
  type ProductPromo,
  type PromoCode,
} from './data';
import { firebaseEnabled, getClientDb, MENU_DOC } from './firebase';

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

/* ---------- Provider ---------- */

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuData>(DEFAULT_MENU);
  // Hydratation : à true dès que la source (Firestore ou localStorage) a répondu
  const [loaded, setLoaded] = useState(!firebaseEnabled);
  const source: 'firebase' | 'demo' = firebaseEnabled ? 'firebase' : 'demo';

  useEffect(() => {
    if (!firebaseEnabled) {
      // MODE DÉMO — écoute le localStorage (autres onglets + même onglet)
      const sync = () => setMenu(readLocalMenu() || DEFAULT_MENU);
      sync();
      setLoaded(true);
      window.addEventListener('storage', sync);
      window.addEventListener(MENU_UPDATED_EVENT, sync);
      return () => {
        window.removeEventListener('storage', sync);
        window.removeEventListener(MENU_UPDATED_EVENT, sync);
      };
    }

    // MODE FIREBASE — 4 abonnements temps réel
    const db = getClientDb();
    if (!db) return;
    const unsubs = [
      onSnapshot(
        doc(db, MENU_DOC.products),
        (s) => setMenu((m) => ({ ...m, products: (s.data()?.items as Product[]) || m.products })),
        (e) => console.error('[menu] products:', e)
      ),
      onSnapshot(
        doc(db, MENU_DOC.categories),
        (s) => setMenu((m) => ({ ...m, categories: s.data()?.items || m.categories })),
        (e) => console.error('[menu] categories:', e)
      ),
      onSnapshot(
        doc(db, MENU_DOC.settings),
        (s) =>
          setMenu((m) => ({
            ...m,
            config: { ...m.config, ...(s.data()?.config as MenuData['config']) },
            banner: { ...m.banner, ...(s.data()?.banner as MenuData['banner']) },
          })),
        (e) => console.error('[menu] settings:', e)
      ),
      onSnapshot(
        doc(db, MENU_DOC.promos),
        (s) =>
          setMenu((m) => ({
            ...m,
            promos: s.data()?.promos || {},
            promoCodes: s.data()?.codes || [],
          })),
        (e) => console.error('[menu] promos:', e)
      ),
    ];
    setLoaded(true);
    return () => unsubs.forEach((u) => u());
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

  return (
    <MenuContext.Provider value={value}>
      {loaded ? children : children /* on rend toujours : DEFAULT_MENU est affiché pendant le chargement */}
    </MenuContext.Provider>
  );
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
