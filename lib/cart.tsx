'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useMenu } from './menu-store';

/* Panier en lignes : chaque ligne = un produit + une quantité, et
   éventuellement la composition choisie pour un menu (« avec Frites ·
   Coca 33 cl »). Deux exemplaires d'un même menu composés différemment
   forment deux lignes distinctes. */
export type CartLine = { id: string; qty: number; note?: string };

type CartContextValue = {
  cart: CartLine[];
  count: number;
  /** Sous-total en prix réels (promos produit appliquées) */
  total: number;
  add: (id: string, note?: string) => void;
  setQty: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clear: () => void;
};

const STORAGE_KEY = 'mc_cart_v3';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { priceOf } = useMenu(); // prix temps réel (promos incluses)

  // Chargement depuis le localStorage après montage (évite tout décalage d'hydratation)
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setCart(
        Array.isArray(raw)
          ? raw.filter((l): l is CartLine => l && typeof l.id === 'string' && typeof l.qty === 'number')
          : []
      );
    } catch {
      setCart([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  const add = useCallback((id: string, note?: string) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && l.note === note);
      if (i >= 0) {
        const next = [...c];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...c, { id, qty: 1, ...(note ? { note } : {}) }];
    });
  }, []);

  const setQty = useCallback((index: number, delta: number) => {
    setCart((c) => {
      const line = c[index];
      if (!line) return c;
      const qty = line.qty + delta;
      if (qty <= 0) return c.filter((_, i) => i !== index);
      const next = [...c];
      next[index] = { ...line, qty };
      return next;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setCart((c) => c.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = cart.reduce((a, l) => a + l.qty, 0);
    const total = cart.reduce((s, l) => s + priceOf(l.id).price * l.qty, 0);
    return { cart, count, total: Math.round(total * 100) / 100, add, setQty, remove, clear };
  }, [cart, priceOf, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un <CartProvider>');
  return ctx;
}
