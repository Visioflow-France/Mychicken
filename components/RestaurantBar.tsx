'use client';

import Icon from './Icon';
import { useLocationCtx } from '@/lib/location-store';

/* Barre permanente sous la navigation : indique le restaurant choisi
   et le mode (livraison / à emporter). « Changer de restaurant »
   ROUVRE le parcours d'entrée (mode + code postal) — pas de bascule
   libre d'un resto à l'autre. Masqué sur un sous-domaine dédié
   (persan./saint-mard.mychicken.fr) : resto imposé par l'adresse. */
export default function RestaurantBar() {
  const { current, locationId, entryMode, openGate, locked } = useLocationCtx();
  if (!locationId) return null;

  return (
    <div className="resto-bar" role="status">
      <span className="rb-info">
        <Icon name="pin" size={13} />
        Vous commandez chez <b>My Chicken {current.city}</b>
        {entryMode && (
          <span className="rb-mode">
            · {entryMode === 'delivery' ? 'Livraison' : 'À emporter'}
          </span>
        )}
      </span>
      {!locked && (
        <button className="rb-change" onClick={openGate}>
          Changer de restaurant
        </button>
      )}
    </div>
  );
}
