'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';
import { useToast } from '@/lib/toast';
import type { MenuData } from '@/lib/data';

type Mutate = (fn: (d: MenuData) => MenuData) => void;

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'categorie';

export default function CategoriesTab({ draft, mutate }: { draft: MenuData; mutate: Mutate }) {
  const toast = useToast();
  const [newLabel, setNewLabel] = useState('');

  const move = (index: number, dir: -1 | 1) =>
    mutate((d) => {
      const cats = [...d.categories];
      const j = index + dir;
      if (j < 0 || j >= cats.length) return d;
      [cats[index], cats[j]] = [cats[j], cats[index]];
      return { ...d, categories: cats };
    });

  const rename = (id: string, label: string) =>
    mutate((d) => ({
      ...d,
      categories: d.categories.map((c) => (c.id === id ? { ...c, label } : c)),
    }));

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    const id = slug(label);
    if (draft.categories.some((c) => c.id === id)) {
      toast('Une catégorie similaire existe déjà');
      return;
    }
    const num = String(draft.categories.length + 1).padStart(2, '0');
    mutate((d) => ({ ...d, categories: [...d.categories, { id, num, label }] }));
    setNewLabel('');
    toast('Catégorie ajoutée au brouillon');
  };

  const remove = (id: string, label: string) => {
    const count = draft.products.filter((p) => p.cat === id).length;
    if (count > 0) {
      toast(`Déplacez ou supprimez les ${count} produit(s) de « ${label} » d'abord`);
      return;
    }
    if (!confirm(`Supprimer la catégorie « ${label} » ?`)) return;
    mutate((d) => ({ ...d, categories: d.categories.filter((c) => c.id !== id) }));
  };

  return (
    <div className="admin-panel">
      <p className="ap-help">
        L&apos;ordre ici est celui de la carte. Les numéros (01, 02…) se recalculent automatiquement à la publication.
      </p>

      <div className="ap-list">
        {draft.categories.map((c, i) => (
          <div className="ap-row" key={c.id}>
            <span className="ap-num">{c.num}</span>
            <input
              className="ap-rename"
              type="text"
              value={c.label}
              aria-label={`Nom de la catégorie ${c.label}`}
              onChange={(e) => rename(c.id, e.target.value)}
            />
            <span className="ap-count">
              {draft.products.filter((p) => p.cat === c.id).length} produit(s)
            </span>
            <div className="ap-actions">
              <button className="icon-btn" title="Monter" onClick={() => move(i, -1)} disabled={i === 0}>
                <Icon name="arrowUp" size={15} />
              </button>
              <button
                className="icon-btn"
                title="Descendre"
                onClick={() => move(i, 1)}
                disabled={i === draft.categories.length - 1}
              >
                <Icon name="arrowDown" size={15} />
              </button>
              <button className="icon-btn danger" title="Supprimer" onClick={() => remove(c.id, c.label)}>
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="ap-addrow">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Nouvelle catégorie (ex. Desserts)"
          aria-label="Nouvelle catégorie"
        />
        <button className="btn btn-solid" onClick={add}>
          <Icon name="plus" size={14} strokeWidth={2.4} /> Ajouter
        </button>
      </div>
    </div>
  );
}
