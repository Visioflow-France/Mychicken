'use client';

/* ================================================================
   RESTAURANTS — fiches des deux établissements.
   Horaires, téléphone, frais/minimum de livraison, zones CP et
   ouvert/fermé sont indépendants pour chaque resto. La carte est
   commune (onglets Carte / Catégories / Promos).

   SYNCHRO : quand un champ identique dans les deux restos est
   modifié d'un seul côté (horaires, frais, minimum, zones, ouvert),
   la publication demande s'il faut l'appliquer aux deux.
   ================================================================ */

import { useEffect, useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { useToast } from '@/lib/toast';
import { publishLocations } from '@/lib/admin-client';
import { useLocationCtx } from '@/lib/location-store';
import type { RestaurantLocation } from '@/lib/data';

const num = (v: string) => Math.round(Number(v.replace(',', '.')) * 100) / 100;

/* Champs potentuellement partagés entre les deux restaurants */
const SHARED_FIELDS: { key: keyof RestaurantLocation; label: string }[] = [
  { key: 'hours', label: 'Horaires' },
  { key: 'deliveryFee', label: 'Frais de livraison' },
  { key: 'minDelivery', label: 'Minimum de livraison' },
  { key: 'deliveryZones', label: 'Zones livrées' },
  { key: 'open', label: 'Ouvert / fermé' },
];

export default function LocationsTab() {
  const toast = useToast();
  const { locations: live } = useLocationCtx();
  const [draft, setDraft] = useState<RestaurantLocation[]>(live);
  const [publishing, setPublishing] = useState(false);
  /* null = pas de question posée ; sinon liste des champs à
     éventuellement copier sur l'autre restaurant. */
  const [syncAsk, setSyncAsk] = useState<{ from: RestaurantLocation; fields: string[] } | null>(null);
  /* Vrai après « Non, seulement ce resto » : on publie sans re-poser
     la question pour ce brouillon. */
  const [skipAsk, setSkipAsk] = useState(false);

  /* Le brouillon suit les fiches live tant qu'il n'y a pas de modifications */
  useEffect(() => {
    setDraft((d) => {
      if (JSON.stringify(d) === JSON.stringify(live)) {
        setSyncAsk(null);
        setSkipAsk(false);
        return live;
      }
      return d;
    });
  }, [live]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(live), [draft, live]);

  const mutate = (id: string, patch: Partial<RestaurantLocation>) =>
    setDraft((d) => d.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  /* Champs qui étaient identiques dans les deux restos et que l'on
     vient de changer d'un seul côté → candidats à la synchro. */
  const sharedChanges = useMemo(() => {
    if (draft.length !== 2 || live.length !== 2) return null;
    const [a, b] = draft;
    const [la, lb] = live;
    const from = JSON.stringify(la) !== JSON.stringify(a) ? { d: a, l: la, o: { d: b, l: lb } } : null;
    const to = JSON.stringify(lb) !== JSON.stringify(b) ? { d: b, l: lb, o: { d: a, l: la } } : null;
    const side = from ?? to;
    if (!side || (from && to)) return null; // modifié des deux côtés : impossible de deviner
    const fields = SHARED_FIELDS.filter(({ key }) => {
      const wasSynced = JSON.stringify(side.l[key]) === JSON.stringify(side.o.l[key]);
      const changed = JSON.stringify(side.d[key]) !== JSON.stringify(side.l[key]);
      return wasSynced && changed;
    }).map((f) => f.label);
    return fields.length ? { city: side.d.city, fields } : null;
  }, [draft, live]);

  const publish = async () => {
    if (sharedChanges && !syncAsk && !skipAsk) {
      setSyncAsk({ from: draft.find((l) => l.city === sharedChanges.city)!, fields: sharedChanges.fields });
      return;
    }
    setPublishing(true);
    try {
      await publishLocations(draft);
      toast('Fiches restaurants publiées !');
      setSyncAsk(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Publication impossible');
    } finally {
      setPublishing(false);
    }
  };

  /* Applique les champs communs modifiés sur l'autre restaurant */
  const applyToBoth = () => {
    if (!syncAsk) return;
    const from = syncAsk.from;
    const keys = SHARED_FIELDS.filter((f) => syncAsk.fields.includes(f.label)).map((f) => f.key);
    setDraft((d) => d.map((l) => (l.id === from.id ? l : { ...l, ...Object.fromEntries(keys.map((k) => [k, from[k]])) })));
    setSyncAsk(null);
    toast('Reporté sur l\u2019autre restaurant — publiez pour appliquer');
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

      {/* Question de synchronisation : champ commun modifié d'un seul côté */}
      {syncAsk && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Synchroniser les deux restaurants ?">
          <div className="modal sync-ask">
            <div className="modal-head">
              <h3>Appliquer aussi à l&apos;autre restaurant ?</h3>
            </div>
            <div className="modal-body">
              <p>
                Vous avez modifié <b>{syncAsk.fields.join(', ')}</b> pour <b>My Chicken {syncAsk.from.city}</b>.
                Ces informations étaient identiques dans les deux restaurants.
              </p>
              <p>Mettre à jour aussi l&apos;autre établissement ?</p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => { setSyncAsk(null); setSkipAsk(true); }}>
                Non, seulement {syncAsk.from.city}
              </button>
              <button className="btn btn-solid" onClick={applyToBoth}>
                Oui, les deux restaurants
              </button>
            </div>
          </div>
        </div>
      )}

      {dirty && (
        <div className="admin-publish-bar">
          <span>
            <b>Modifications non publiées</b> — les fiches en ligne sont inchangées pour l&apos;instant.
            {sharedChanges && ' ⚠️ Un champ commun a été modifié d\'un seul côté.'}
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
