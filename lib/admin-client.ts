'use client';

/* ================================================================
   Client d'écriture pour le dashboard /admin.
   • Firebase configuré → appelle les routes API sécurisées (cookie
     admin) qui écrivent dans Firestore via le SDK Admin.
   • Mode démo → écrit directement dans le localStorage.
   Dans les deux cas, le MenuProvider réagit instantanément.
   ================================================================ */

import { firebaseEnabled } from './firebase';
import type { MenuData, OrderStatus, RestaurantLocation } from './data';
import { writeLocalMenu, refreshPublishedMenu } from './menu-store';
import { writeLocalLocations } from './location-store';
import { updateDemoOrder } from './orders-store';

async function api(path: string, init: RequestInit): Promise<Record<string, unknown>> {
  const res = await fetch(path, { credentials: 'same-origin', ...init });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error((json.error as string) || `Erreur ${res.status}`);
  return json;
}

/** Publie le menu complet (doc unique menu/published). */
export async function publishMenu(menu: MenuData): Promise<void> {
  if (firebaseEnabled) {
    await api('/api/admin/menu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menu),
    });
    // Une SEULE re-lecture du doc publié pour rafraîchir les écrans
    refreshPublishedMenu();
  } else {
    writeLocalMenu(menu);
  }
}

/** Remet le menu à zéro (valeurs d'origine du flyer). */
export async function resetMenu(): Promise<void> {
  if (firebaseEnabled) {
    await api('/api/admin/menu/reset', { method: 'POST' });
  } else {
    localStorage.removeItem('mc_menu_overrides');
    window.dispatchEvent(new CustomEvent('mc-menu-updated'));
  }
}

/** Publie les fiches des deux restaurants (dans le doc unique). */
export async function publishLocations(locations: RestaurantLocation[]): Promise<void> {
  if (firebaseEnabled) {
    await api('/api/admin/locations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locations }),
    });
    refreshPublishedMenu();
  } else {
    writeLocalLocations(locations);
  }
}

/** Met à jour le statut / paiement d'une commande. */
export async function patchOrder(id: string, patch: { status?: OrderStatus; paid?: boolean }): Promise<void> {
  if (firebaseEnabled) {
    await api('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    });
  } else {
    updateDemoOrder(id, patch);
  }
}

/* ---------- Session admin ---------- */

export async function checkSession(): Promise<{ authed: boolean; defaultPassword?: boolean }> {
  return api('/api/admin/auth', { method: 'GET' }) as Promise<{ authed: boolean; defaultPassword?: boolean }>;
}

export async function login(password: string): Promise<{ ok?: boolean; defaultPassword?: boolean; error?: string }> {
  return api('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
}

export async function logout(): Promise<void> {
  await api('/api/admin/auth', { method: 'DELETE' });
}
