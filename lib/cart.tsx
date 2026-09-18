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
import { byId } from './data';

type Cart = Record<string, number>;

type CartContextValue = {
  cart: Cart;
  count: number;
  total: number;
  add: (id: string) => void;
  setQty: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const STORAGE_KEY = 'mc_cart_v2';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({});
  const [loaded, setLoaded] = useState(false);

  // Chargement depuis le localStorage après montage (évite tout décalage d'hydratation)
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
    } catch {
      setCart({});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, loaded]);

  const add = useCallback((id: string) => {
    setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }, []);

  const setQty = useCallback((id: string, delta: number) => {
    setCart((c) => {
      const next = { ...c };
      if (!next[id]) return c;
      next[id] += delta;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }, []);

  const clear = useCallback(() => setCart({}), []);

  const value = useMemo<CartContextValue>(() => {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    const total = Object.entries(cart).reduce(
      (s, [id, q]) => s + (byId(id)?.price || 0) * q,
      0
    );
    return { cart, count, total, add, setQty, remove, clear };
  }, [cart, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un <CartProvider>');
  return ctx;
}
