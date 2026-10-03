'use client';

/* ================================================================
   RESTAURANTS — fiches des deux établissements.
   Horaires, téléphone, frais/minimum de livraison, zones CP et
   ouvert/fermé sont indépendants pour chaque resto. La carte est
   commune (onglets Carte / Catégories / Promos).
   ================================================================ */

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { useToast } from '@/lib/toast';
import { publishLocations } from '@/lib/admin-client';
import { useLocationCtx } from '@/lib/location-store';
import type { RestaurantLocation } from '@/lib/data';

const num = (v: string) => Math.round(Number(v.replace(',', '.')) * 100) / 100;

export default function LocationsTab() {
  const toast = useToast();
  const { locations: live } = useLocationCtx();
  const [draft, setDraft] = useState<RestaurantLocation[]>(live);
  const [publishing, setPublishing] = useState(false);

  /* Le brouillon suit les fiches live tant qu'il n'y a pas de modifications */
  useEffect(() => {
    setDraft((d) => (JSON.stringify(d) === JSON.stringify(live) ? live : d));
  }, [live]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(live), [draft, live]);

  const mutate = (id: string, patch: Partial<RestaurantLocation>) =>
    setDraft((d) => d.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const publish = async () => {
    setPublishing(true);
    try {
      await publishLocations(draft);
      toast('Fiches restaurants publiées !');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Publication impossible');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="admin-stack">
      <p className="ap-help">
        Ces fiches alimentent la popup de choix, le footer, la page contact et les frais de livraison.
        La carte est commune aux deux restaurants.
      </p>

      {draft.map((l) => (
        <section className="admin-panel" key={l.id}>
          <h3 className="ap-title">
            <Icon name="pin" size={16} /> My Chicken {l.city}
          </h3>

          <label className="switch big">
            <input type="checkbox" checked={l.open} onChange={(e) => mutate(l.id, { open: e.target.checked })} />
            <span />
            {l.open ? 'OUVERT aux commandes' : 'FERMÉ aux commandes'}
          </label>

          <div className="form-grid">
            <div className="f-group">
              <label>Adresse</label>
              <input type="text" value={l.address} onChange={(e) => mutate(l.id, { address: e.target.value })} />
            </div>
            <div className="f-group">
              <label>Code postal</label>
              <input type="text" value={l.postal} maxLength={5} onChange={(e) => mutate(l.id, { postal: e.target.value.replace(/\D/g, '') })} />
            </div>
            <div className="f-group">
              <label>Ville</label>
              <input type="text" value={l.city} onChange={(e) => mutate(l.id, { city: e.target.value })} />
            </div>
            <div className="f-group">
              <label>Téléphone</label>
              <input type="tel" value={l.phone} onChange={(e) => mutate(l.id, { phone: e.target.value })} />
            </div>
            <div className="f-group">
              <label>Horaires</label>
              <input type="text" value={l.hours} onChange={(e) => mutate(l.id, { hours: e.target.value })} />
            </div>
            <div className="f-group">
              <label>Frais de livraison (€)</label>
              <input type="number" step="0.10" min="0" value={l.deliveryFee} onChange={(e) => mutate(l.id, { deliveryFee: num(e.target.value) })} />
            </div>
            <div className="f-group">
              <label>Livraison à partir de (€)</label>
              <input type="number" step="1" min="0" value={l.minDelivery} onChange={(e) => mutate(l.id, { minDelivery: num(e.target.value) })} />
            </div>
            <div className="f-group">
              <label>Zones livrées (codes postaux, séparés par des virgules)</label>
              <input
                type="text"
                value={l.deliveryZones.join(', ')}
                onChange={(e) =>
                  mutate(l.id, {
                    deliveryZones: e.target.value.split(',').map((z) => z.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        </section>
      ))}

      {dirty && (
        <div className="admin-publish-bar">
          <span>
            <b>Modifications non publiées</b> — les fiches en ligne sont inchangées pour l&apos;instant.
          </span>
          <div className="apb-actions">
            <button className="btn btn-ghost" onClick={() => setDraft(live)} disabled={publishing}>
              Annuler
            </button>
            <button className="btn btn-solid" onClick={publish} disabled={publishing}>
              {publishing ? 'Publication…' : 'Publier en direct'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
