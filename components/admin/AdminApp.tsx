'use client';

/* ================================================================
   DASHBOARD ADMIN — My Chicken
   • Carte : produits, catégories, prix, images — édition complète
   • Promos : promos produit, codes panier, bandeau du site
   • Commandes : temps réel, statuts, paiement
   • Réglages : ouvert/fermé, frais de livraison, minimum

   Les modifications sont d'abord un BROUILLON local ; le bouton
   « Publier » les pousse en temps réel (Firestore ou localStorage
   en mode démo) sur TOUS les écrans des visiteurs.
   ================================================================ */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMenu } from '@/lib/menu-store';
import { useToast } from '@/lib/toast';
import { checkSession, login, logout, publishMenu, resetMenu } from '@/lib/admin-client';
import type { MenuData } from '@/lib/data';
import Icon, { RoosterMark } from '@/components/Icon';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import PromosTab from './PromosTab';
import OrdersTab from './OrdersTab';
import SettingsTab from './SettingsTab';

type Tab = 'products' | 'categories' | 'promos' | 'orders' | 'settings';

const TABS: { id: Tab; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { id: 'products', label: 'Carte', icon: 'utensils' },
  { id: 'categories', label: 'Catégories', icon: 'menu' },
  { id: 'promos', label: 'Promos', icon: 'tag' },
  { id: 'orders', label: 'Commandes', icon: 'bag' },
  { id: 'settings', label: 'Réglages', icon: 'scooter' },
];

export default function AdminApp() {
  const toast = useToast();
  const { menu, source } = useMenu();
  const [authed, setAuthed] = useState<boolean | null>(null); // null = vérification en cours
  const [defaultPassword, setDefaultPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [tab, setTab] = useState<Tab>('products');
  const [draft, setDraft] = useState<MenuData>(menu);
  const [publishing, setPublishing] = useState(false);

  /* Session au chargement */
  useEffect(() => {
    checkSession()
      .then((s) => {
        setAuthed(s.authed);
        setDefaultPassword(Boolean(s.defaultPassword));
      })
      .catch(() => setAuthed(false));
  }, []);

  /* Le brouillon suit la carte live tant qu'il n'y a pas de modifications en cours */
  useEffect(() => {
    setDraft((d) => (JSON.stringify(d) === JSON.stringify(menu) ? menu : d));
  }, [menu]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(menu), [draft, menu]);

  const mutate = useCallback((fn: (d: MenuData) => MenuData) => setDraft(fn), []);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await login(password);
      setAuthed(true);
      setDefaultPassword(Boolean(res.defaultPassword));
      setPassword('');
      toast('Bienvenue dans votre dashboard !');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Connexion impossible');
    }
  };

  const doLogout = async () => {
    await logout().catch(() => {});
    setAuthed(false);
  };

  const publish = async () => {
    setPublishing(true);
    try {
      // Les numéros de catégories suivent leur ordre (01, 02, 03…)
      const toPublish: MenuData = {
        ...draft,
        categories: draft.categories.map((c, i) => ({ ...c, num: String(i + 1).padStart(2, '0') })),
      };
      setDraft(toPublish);
      await publishMenu(toPublish);
      toast('Publié — vos clients voient la carte à jour en direct !');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Publication impossible');
    } finally {
      setPublishing(false);
    }
  };

  const discard = () => setDraft(menu);

  const hardReset = async () => {
    if (!confirm('Remettre toute la carte aux valeurs d\'origine du flyer ? Cette action est immédiate.')) return;
    try {
      await resetMenu();
      toast('Carte réinitialisée');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Réinitialisation impossible');
    }
  };

  /* ---------- Écran de connexion ---------- */
  if (authed === null) {
    return (
      <div className="admin-root">
        <div className="admin-loading">Vérification de la session…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-root">
        <form className="admin-login" onSubmit={doLogin}>
          <span className="al-mark" aria-hidden="true">
            <RoosterMark />
          </span>
          <h1>Espace administrateur</h1>
          <p className="al-sub">My Chicken — gestion de la carte, des promos et des commandes</p>
          {loginError && <p className="al-error">{loginError}</p>}
          <div className="f-group">
            <label htmlFor="adminPass">Mot de passe</label>
            <input
              id="adminPass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn btn-solid btn-block">
            Entrer
          </button>
          <p className="al-hint">
            Mot de passe par défaut : <b>mychicken</b> — à changer via la variable ADMIN_PASSWORD.
          </p>
        </form>
      </div>
    );
  }

  /* ---------- Dashboard ---------- */
  return (
    <div className="admin-root">
      <header className="admin-top">
        <div className="at-left">
          <span className="at-mark" aria-hidden="true">
            <RoosterMark />
          </span>
          <div>
            <b>Pilotage My Chicken</b>
            <span className={`at-mode ${source}`}>
              {source === 'firebase' ? '● Firebase temps réel' : '● Mode démo (ce navigateur)'}
            </span>
          </div>
        </div>
        <div className="at-right">
          <a href="/" target="_blank" rel="noreferrer" className="at-link">
            Voir le site <Icon name="arrowRight" size={14} strokeWidth={2.2} />
          </a>
          <button className="at-link" onClick={doLogout}>
            Quitter
          </button>
        </div>
      </header>

      {defaultPassword && (
        <div className="admin-warn">
          ⚠︎ Vous utilisez le mot de passe par défaut. Définissez <code>ADMIN_PASSWORD</code> dans
          les variables d&apos;environnement pour sécuriser l&apos;accès.
        </div>
      )}

      <nav className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`admin-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={15} strokeWidth={2.2} />
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === 'products' && <ProductsTab draft={draft} mutate={mutate} />}
        {tab === 'categories' && <CategoriesTab draft={draft} mutate={mutate} />}
        {tab === 'promos' && <PromosTab draft={draft} mutate={mutate} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'settings' && <SettingsTab draft={draft} mutate={mutate} onReset={hardReset} />}
      </main>

      {/* Barre de publication — visible dès qu'un brouillon diffère de la carte en ligne */}
      {dirty && tab !== 'orders' && (
        <div className="admin-publish-bar">
          <span>
            <b>Modifications non publiées</b> — la carte en ligne est inchangée pour l&apos;instant.
          </span>
          <div className="apb-actions">
            <button className="btn btn-ghost" onClick={discard} disabled={publishing}>
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
