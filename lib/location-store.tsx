'use client';

/* ================================================================
   LocationProvider — le restaurant sélectionné pour tout le site.
   QUOTA SPARK : aucune lecture Firestore propre — les fiches
   restaurants arrivent avec le menu publié (doc unique
   « menu/published », lu une fois par visite par le MenuProvider).
   Le choix du client est mémorisé dans mc_location.
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
import { LOCATIONS, type OrderMode, type RestaurantLocation } from './data';
import { useMenu } from './menu-store';

export const LOCAL_LOCATIONS_KEY = 'mc_locations';
export const LOCAL_LOCATION_KEY = 'mc_location';
export const LOCATIONS_UPDATED_EVENT = 'mc-locations-updated';

/* Mode démo uniquement : overrides locaux des fiches */
export function readLocalLocations(): RestaurantLocation[] | null {
  try {
    const raw = localStorage.getItem(LOCAL_LOCATIONS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RestaurantLocation[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLocalLocations(locations: RestaurantLocation[]) {
  localStorage.setItem(LOCAL_LOCATIONS_KEY, JSON.stringify(locations));
  window.dispatchEvent(new CustomEvent(LOCATIONS_UPDATED_EVENT));
}

export function clearLocalLocations() {
  localStorage.removeItem(LOCAL_LOCATIONS_KEY);
  window.dispatchEvent(new CustomEvent(LOCATIONS_UPDATED_EVENT));
}

type LocationContextValue = {
  locations: RestaurantLocation[];
  source: 'firebase' | 'demo';
  /** Restaurant sélectionné (ou LOCATIONS[0] par défaut) */
  current: RestaurantLocation;
  locationId: string | null; // null = pas encore choisi (popup d'entrée)
  choose: (id: string) => void;
  /** Popup d'entrée / changement de restaurant */
  gateOpen: boolean;
  openGate: () => void;
  closeGate: () => void;
  /** Trouve le restaurant qui livre ce code postal */
  findByPostal: (postal: string) => RestaurantLocation | null;
};

const LocationContext = createContext<LocationContextValue | null>(null);

/* Doit être rendu À L'INTÉRIEUR du MenuProvider (les fiches viennent du menu). */
export function LocationProvider({ children }: { children: ReactNode }) {
  const { menu, source } = useMenu();
  const [localLocations, setLocalLocations] = useState<RestaurantLocation[] | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);

  /* Choix mémorisé + overrides locaux (mode démo) */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_LOCATION_KEY);
      if (saved) setLocationId(saved);
      else setGateOpen(true); // premier accès → popup de choix
    } catch {
      setGateOpen(true);
    }
    const sync = () => setLocalLocations(readLocalLocations());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener(LOCATIONS_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(LOCATIONS_UPDATED_EVENT, sync);
    };
  }, []);

  const locations = useMemo(
    () => localLocations || menu.locations || LOCATIONS,
    [localLocations, menu.locations]
  );

  const choose = useCallback((id: string) => {
    setLocationId(id);
    try {
      localStorage.setItem(LOCAL_LOCATION_KEY, id);
    } catch {
      /* stockage indisponible — le choix reste en mémoire pour la session */
    }
    setGateOpen(false);
  }, []);

  const findByPostal = useCallback(
    (postal: string): RestaurantLocation | null => {
      const cp = postal.trim().replace(/\s/g, '');
      if (!/^\d{5}$/.test(cp)) return null;
      return locations.find((l) => l.deliveryZones.includes(cp)) || null;
    },
    [locations]
  );

  const current = useMemo(
    () => locations.find((l) => l.id === locationId) || locations[0],
    [locations, locationId]
  );

  const value = useMemo<LocationContextValue>(
    () => ({
      locations,
      source,
      current,
      locationId,
      choose,
      gateOpen,
      openGate: () => setGateOpen(true),
      closeGate: () => setGateOpen(false),
      findByPostal,
    }),
    [locations, source, current, locationId, choose, gateOpen, findByPostal]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationCtx(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationCtx doit être utilisé dans un <LocationProvider>');
  return ctx;
}

export { orderPrefix } from './data';

/** Libellé du mode de commande pour l'affichage client. */
export function modeLabel(mode: OrderMode): string {
  return mode === 'delivery' ? 'Livraison' : mode === 'takeaway' ? 'À emporter' : 'Sur place';
}
