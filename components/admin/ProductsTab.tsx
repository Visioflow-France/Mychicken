'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { useToast } from '@/lib/toast';
import { fmt, promoPrice, type MenuData, type Product } from '@/lib/data';

type Mutate = (fn: (d: MenuData) => MenuData) => void;

const slug = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'produit';

const emptyProduct = (cat: string): Product => ({
  id: '',
  name: '',
  price: 5,
  cat,
  img: '',
  desc: '',
  popular: false,
  available: true,
});

export default function ProductsTab({ draft, mutate }: { draft: MenuData; mutate: Mutate }) {
  const toast = useToast();
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null); // produit en cours d'édition (copie)
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadInfo, setUploadInfo] = useState('');
  const [uploadError, setUploadError] = useState('');

  /* ---- Upload quota-friendly : compression WebP côté client ----
     Max 800 px de large, qualité 0.80 puis décroissante jusqu'à
     rester sous 150 Ko. L'ancienne image bucket est nettoyée à la
     publication (sweep côté serveur). */
  const handleUpload = async (file: File) => {
    setUploadInfo('');
    setUploadError('');
    setUploading(true);
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, 800 / bitmap.width);
      const w = Math.round(bitmap.width * scale);
      const h = Math.round(bitmap.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
      bitmap.close();

      // Qualité décroissante jusqu'à passer sous 150 Ko
      let blob: Blob | null = null;
      let quality = 0.8;
      while (quality >= 0.4) {
        blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', quality));
        if (blob && blob.size <= 150 * 1024) break;
        quality -= 0.1;
      }
      if (!blob) throw new Error('Compression impossible');
      if (blob.size > 150 * 1024) {
        // Dernier recours : on réduit la largeur
        canvas.width = Math.round(w * 0.7);
        canvas.height = Math.round(h * 0.7);
        canvas.getContext('2d')!.drawImage(canvas, 0, 0);
        blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.7));
      }
      if (!blob || blob.size > 150 * 1024) throw new Error('Image trop lourde même compressée');

      const form = new FormData();
      form.append('file', new File([blob], 'photo.webp', { type: 'image/webp' }));
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const data = (await res.json()) as { url?: string; size?: number; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload refusé');

      setEditing((e) => (e ? { ...e, img: data.url! } : e));
      setUploadInfo(`WebP ${(blob.size / 1024).toFixed(0)} Ko ✓`);
      toast('Photo compressée et envoyée !');
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Échec de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return draft.products
      .filter((p) => filterCat === 'all' || p.cat === filterCat)
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.id.includes(q));
  }, [draft.products, filterCat, search]);

  const catLabel = (id: string) => draft.categories.find((c) => c.id === id)?.label || id;

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast('Donnez un nom au produit');
      return;
    }
    const price = Number(editing.price);
    if (!(price >= 0)) {
      toast('Prix invalide');
      return;
    }
    const clean: Product = {
      ...editing,
      price: Math.round(price * 100) / 100,
      name: editing.name.trim(),
      img: editing.img.trim(),
      desc: editing.desc.trim(),
    };
    mutate((d) => {
      if (isNew) {
        const id = clean.id.trim() || `${slug(clean.name)}-${Date.now().toString(36).slice(-4)}`;
        return { ...d, products: [...d.products, { ...clean, id }] };
      }
      return { ...d, products: d.products.map((p) => (p.id === clean.id ? clean : p)) };
    });
    setEditing(null);
    toast(isNew ? 'Produit ajouté au brouillon' : 'Produit modifié — pensez à publier');
  };

  const remove = (p: Product) => {
    if (!confirm(`Supprimer « ${p.name} » de la carte ?`)) return;
    mutate((d) => {
      const promos = { ...d.promos };
      delete promos[p.id];
      return { ...d, products: d.products.filter((x) => x.id !== p.id), promos };
    });
    toast('Produit supprimé du brouillon');
  };

  const toggle = (id: string, field: 'popular' | 'available') =>
    mutate((d) => ({
      ...d,
      products: d.products.map((p) =>
        p.id === id ? { ...p, [field]: field === 'available' ? p.available !== false ? false : true : !p.popular } : p
      ),
    }));

  const setPromo = (id: string, promo: MenuData['promos'][string] | undefined) =>
    mutate((d) => {
      const promos = { ...d.promos };
      if (promo) promos[id] = promo;
      else delete promos[id];
      return { ...d, promos };
    });

  return (
    <div className="admin-panel">
      <div className="ap-toolbar">
        <div className="ap-filters">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} aria-label="Filtrer par catégorie">
            <option value="all">Toutes les catégories</option>
            {draft.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher"
          />
        </div>
        <button
          className="btn btn-solid ap-add"
          onClick={() => {
            setEditing(emptyProduct(filterCat === 'all' ? draft.categories[0]?.id || 'menus' : filterCat));
            setIsNew(true);
          }}
        >
          <Icon name="plus" size={14} strokeWidth={2.4} /> Nouveau produit
        </button>
      </div>

      <div className="ap-list">
        {rows.map((p) => {
          const promo = draft.promos[p.id];
          const finalPrice = promoPrice(p.price, promo);
          return (
            <div className="ap-row" key={p.id}>
              <span className="ap-thumb">
                {p.img ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.img} alt="" /> : null}
              </span>
              <div className="ap-info">
                <b>{p.name}</b>
                <span className="ap-cat">
                  {catLabel(p.cat)}
                  {p.popular && <i className="chip gold">Best-seller</i>}
                  {p.available === false && <i className="chip red">Épuisé</i>}
                  {promo && <i className="chip green">Promo {fmt(finalPrice)}</i>}
                </span>
              </div>
              <span className="ap-price">
                {promo && finalPrice !== p.price && <s>{fmt(p.price)}</s>}
                {fmt(finalPrice)}
              </span>
              <div className="ap-actions">
                <button
                  className="icon-btn"
                  title={p.popular ? 'Retirer des best-sellers' : 'Marquer best-seller'}
                  onClick={() => toggle(p.id, 'popular')}
                >
                  <Icon name="heart" size={15} />
                </button>
                <button
                  className="icon-btn"
                  title={p.available === false ? 'Remettre en vente' : 'Marquer épuisé'}
                  onClick={() => toggle(p.id, 'available')}
                >
                  <Icon name={p.available === false ? 'close' : 'check'} size={15} />
                </button>
                <button
                  className="icon-btn edit"
                  title="Modifier"
                  onClick={() => {
                    setEditing({ ...p });
                    setIsNew(false);
                  }}
                >
                  <Icon name="menu" size={15} />
                </button>
                <button className="icon-btn danger" title="Supprimer" onClick={() => remove(p)}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="ap-empty">Aucun produit ne correspond.</p>}
      </div>

      {/* ---------- Modale d'édition ---------- */}
      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Édition du produit">
            <div className="modal-head">
              <h3>{isNew ? 'Nouveau produit' : `Modifier — ${editing.name}`}</h3>
              <button className="icon-btn" onClick={() => setEditing(null)} aria-label="Fermer">
                <Icon name="close" size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="f-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  placeholder="Menu Cuisse…"
                />
              </div>

              <div className="form-grid">
                <div className="f-group">
                  <label>Prix (€)</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="f-group">
                  <label>Catégorie</label>
                  <select
                    value={editing.cat}
                    onChange={(e) => setEditing({ ...editing, cat: e.target.value })}
                  >
                    {draft.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="f-group">
                <label>Lien de l&apos;image — ou téléverser une photo</label>
                <input
                  type="text"
                  value={editing.img}
                  onChange={(e) => setEditing({ ...editing, img: e.target.value })}
                  placeholder="https://…"
                />
                <div className="upload-row">
                  <label className="btn btn-ghost small upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(f);
                        e.target.value = '';
                      }}
                    />
                    📷 Choisir un fichier
                  </label>
                  {uploading && <span className="upload-status">Compression &amp; envoi…</span>}
                  {uploadInfo && <span className="upload-status ok">{uploadInfo}</span>}
                  {uploadError && <span className="upload-status ko">{uploadError}</span>}
                </div>
                <p className="upload-hint">
                  Compressée automatiquement en WebP (max 800 px, ≤ 150 Ko). L&apos;ancienne
                  image du bucket est supprimée à la publication.
                </p>
                {editing.img && (
                  <span className="ap-thumb big">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={editing.img} alt="Aperçu" />
                  </span>
                )}
              </div>

              <div className="f-group">
                <label>Description</label>
                <textarea
                  style={{ minHeight: '80px' }}
                  value={editing.desc}
                  onChange={(e) => setEditing({ ...editing, desc: e.target.value })}
                  placeholder="1 cuisse + 1 accompagnement + 1 boisson 33 cl"
                />
              </div>

              <div className="check-row">
                <label className="check-opt">
                  <input
                    type="checkbox"
                    checked={Boolean(editing.popular)}
                    onChange={(e) => setEditing({ ...editing, popular: e.target.checked })}
                  />
                  Best-seller
                </label>
                <label className="check-opt">
                  <input
                    type="checkbox"
                    checked={editing.available !== false}
                    onChange={(e) => setEditing({ ...editing, available: e.target.checked })}
                  />
                  Disponible à la vente
                </label>
              </div>

              {/* Promo produit */}
              <div className="promo-editor">
                <label>Promo sur ce produit</label>
                {!isNew && !draft.promos[editing.id] && (
                  <div className="pe-add">
                    <select
                      defaultValue="percent"
                      id="peType"
                      aria-label="Type de promo"
                    >
                      <option value="percent">− %</option>
                      <option value="amount">− €</option>
                      <option value="price">Nouveau prix</option>
                    </select>
                    <input type="number" step="0.10" min="0" id="peValue" placeholder="Valeur" aria-label="Valeur de la promo" />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        const type = (document.getElementById('peType') as HTMLSelectElement).value as 'percent' | 'amount' | 'price';
                        const value = Number((document.getElementById('peValue') as HTMLInputElement).value);
                        if (!(value > 0)) return toast('Indiquez une valeur de promo');
                        setPromo(editing.id, { type, value });
                      }}
                    >
                      Ajouter la promo
                    </button>
                  </div>
                )}
                {draft.promos[editing.id] && (
                  <div className="pe-current">
                    <span>
                      {draft.promos[editing.id]!.type === 'percent' && `−${draft.promos[editing.id]!.value} %`}
                      {draft.promos[editing.id]!.type === 'amount' && `−${fmt(draft.promos[editing.id]!.value)}`}
                      {draft.promos[editing.id]!.type === 'price' && `prix fixe ${fmt(draft.promos[editing.id]!.value)}`}
                      {' → '}<b>{fmt(promoPrice(editing.price, draft.promos[editing.id]))}</b>
                    </span>
                    <button type="button" className="icon-btn danger" onClick={() => setPromo(editing.id, undefined)}>
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                )}
                {isNew && <p className="pe-note">Enregistrez d&apos;abord le produit, puis ajoutez sa promo.</p>}
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>
                Annuler
              </button>
              <button className="btn btn-solid" onClick={save}>
                {isNew ? 'Ajouter au brouillon' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
