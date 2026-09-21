'use client';

/* ================================================================
   Commandes temps réel pour le dashboard /admin.
   • Firebase → onSnapshot sur la collection « orders ».
   • Mode démo → commandes « téléphone » enregistrées localement
     (mc_demo_orders) pour pouvoir tester l'onglet Commandes.
   ================================================================ */

import { useCallback, useEffect, useState } from 'react';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import type { Order } from './data';
import { firebaseEnabled, getClientDb, ORDERS_COLLECTION } from './firebase';

const DEMO_ORDERS_KEY = 'mc_demo_orders';
export const ORDERS_UPDATED_EVENT = 'mc-orders-updated';

/* ---------- Mode démo ---------- */

export function readDemoOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addDemoOrder(order: Order) {
  const next = [order, ...readDemoOrders()].slice(0, 100);
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
}

export function updateDemoOrder(id: string, patch: Partial<Order>) {
  const next = readDemoOrders().map((o) => (o.id === id ? { ...o, ...patch } : o));
  localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
}

/* ---------- Hook ---------- */

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const source = firebaseEnabled ? 'firebase' : 'demo';

  useEffect(() => {
    if (!firebaseEnabled) {
      const sync = () => setOrders(readDemoOrders());
      sync();
      window.addEventListener('storage', sync);
      window.addEventListener(ORDERS_UPDATED_EVENT, sync);
      return () => {
        window.removeEventListener('storage', sync);
        window.removeEventListener(ORDERS_UPDATED_EVENT, sync);
      };
    }
    const db = getClientDb();
    if (!db) return;
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'), limit(100));
    const unsub = onSnapshot(
      q,
      (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))),
      (e) => console.error('[orders]:', e)
    );
    return () => unsub();
  }, []);

  const refresh = useCallback(() => setOrders(readDemoOrders()), []);
  return { orders, source };
}
