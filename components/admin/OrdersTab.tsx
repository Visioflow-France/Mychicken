'use client';

import { useState } from 'react';
import Icon, { type IconName } from '@/components/Icon';
import { useOrders } from '@/lib/orders-store';
import { useLocationCtx } from '@/lib/location-store';
import { patchOrder } from '@/lib/admin-client';
import { fmt, type Order, type OrderStatus } from '@/lib/data';

const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: 'Nouvelle',
  en_preparation: 'En préparation',
  prete: 'Prête',
  terminee: 'Terminée',
  annulee: 'Annulée',
};

const MODE_LABELS: Record<Order['mode'], { label: string; icon: IconName }> = {
  takeaway: { label: 'À emporter', icon: 'bag' },
  dinein: { label: 'Sur place', icon: 'utensils' },
  delivery: { label: 'Livraison', icon: 'scooter' },
};

const timeFmt = (ts: number) =>
  new Date(ts).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Ticket cuisine complet — ouvert dans une fenêtre d'impression dédiée */
function printTicket(o: Order, locName: string, locAddress: string) {
  const c = o.customer || {};
  const dl: string[] = [];
  if (c.building) dl.push(`Bâtiment : ${c.building}`);
  if (c.door) dl.push(`Porte : ${c.door}`);
  if (c.accessCode) dl.push(`Code d'accès : ${c.accessCode}`);
  if (c.intercom) dl.push(`Interphone : ${c.intercom}`);
  if (c.floor) dl.push(`Étage : ${c.floor}`);

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Ticket ${esc(o.num)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#111;padding:14px;max-width:340px;margin:0 auto;font-size:13px}
  h1{font-size:19px;text-align:center;letter-spacing:.04em}
  .sub{text-align:center;color:#555;margin:2px 0 8px;font-size:11px}
  .num{border:2px solid #111;border-radius:6px;text-align:center;font-size:17px;font-weight:700;padding:5px;margin:8px 0}
  .row{display:flex;justify-content:space-between;padding:2px 0}
  hr{border:none;border-top:1px dashed #999;margin:8px 0}
  .items .row b{font-size:14px}
  .total{font-size:16px;font-weight:700}
  .note{background:#fff3cd;border-radius:4px;padding:6px;margin-top:6px;font-size:12px}
  .dl div{padding:1px 0}
  .foot{margin-top:10px;text-align:center;color:#777;font-size:10px}
  @media print{body{padding:0}}
</style></head><body>
  <h1>MY CHICKEN</h1>
  <p class="sub">${esc(locName)} — ${esc(locAddress)}</p>
  <div class="num">${esc(o.num)}</div>
  <div class="row"><span>${esc(MODE_LABELS[o.mode]?.label || o.mode)}</span><span>${esc(timeFmt(o.createdAt))}</span></div>
  <div class="row"><span>Paiement</span><span>${o.paid ? 'Payé en ligne' : 'À la réception'} · ${o.payment === 'card' ? 'Carte' : 'Téléphone'}</span></div>
  <hr>
  <div class="items">
    ${o.items.map((it) => `<div class="row"><span><b>${it.qty}×</b> ${esc(it.name)}</span><span>${esc(fmt(it.price * it.qty))}</span></div>`).join('\n    ')}
  </div>
  <hr>
  <div class="row"><span>Sous-total</span><span>${esc(fmt(o.subtotal))}</span></div>
  ${o.discount > 0 ? `<div class="row"><span>Code ${esc(o.promoCode || '')}</span><span>−${esc(fmt(o.discount))}</span></div>` : ''}
  ${o.fee > 0 ? `<div class="row"><span>Livraison</span><span>${esc(fmt(o.fee))}</span></div>` : ''}
  <div class="row total"><span>TOTAL</span><span>${esc(fmt(o.total))}</span></div>
  <hr>
  <div class="row"><span><b>Client</b></span></div>
  <div class="row"><span>${esc(c.name || '—')}</span><span>${esc(c.phone || '')}</span></div>
  ${c.address ? `<div class="row"><span>Adresse : ${esc(c.address || '')}</span></div>` : ''}
  ${dl.length ? `<div class="dl">${dl.map((l) => `<div>${esc(l)}</div>`).join('')}</div>` : ''}
  ${c.note ? `<div class="note"><b>Instructions :</b> ${esc(c.note || '')}</div>` : ''}
  <p class="foot">Ticket généré le ${new Date().toLocaleString('fr-FR')} — My Chicken</p>
</body></html>`;

  /* Impression via une iframe cachée : fonctionne même quand les
     popups sont bloqués (navigateur intégré, kiosque cuisine…). */
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 60_000); // nettoyage après impression
  };
  // Certains navigateurs ne déclenchent pas onload sur les iframes about:blank réécrites
  setTimeout(() => {
    if (iframe.contentDocument?.body) {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  }, 350);
}

export default function OrdersTab({ locationId }: { locationId?: string }) {
  const { orders: all, source } = useOrders();
  const { locations } = useLocationCtx();
  /* Commandes du restaurant sélectionné (les anciennes sans locationId restent visibles) */
  const orders = locationId
    ? all.filter((o) => !o.locationId || o.locationId === locationId)
    : all;
  const loc = locations.find((l) => l.id === locationId) || locations[0];

  const set = (o: Order, patch: { status?: OrderStatus; paid?: boolean }) =>
    patchOrder(o.id, patch).catch((e) => console.error(e));

  const active = orders.filter((o) => o.status !== 'terminee' && o.status !== 'annulee');

  /* Recherche dans les anciennes commandes : n°, nom, téléphone, adresse */
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();
  const digits = needle.replace(/\D/g, '');
  const visible = needle
    ? orders.filter((o) => {
        const hay = [o.num, o.customer?.name, o.customer?.phone, o.customer?.address, o.promoCode]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const phone = (o.customer?.phone || '').replace(/\s/g, '');
        return hay.includes(needle) || (digits.length >= 4 && phone.includes(digits));
      })
    : orders;

  return (
    <div className="admin-stack">
      {source === 'demo' && (
        <p className="ap-help">
          Mode démo : seules les commandes passées depuis ce navigateur apparaissent. Avec Firebase, toutes les
          commandes de tous les clients arrivent ici en temps réel.
        </p>
      )}

      <div className="orders-search">
        <Icon name="phone" size={14} />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une ancienne commande (n°, nom, téléphone, adresse…)"
          aria-label="Rechercher une commande"
        />
        {search && (
          <button type="button" className="os-clear" onClick={() => setSearch('')} aria-label="Effacer la recherche">
            ✕
          </button>
        )}
      </div>

      <div className="orders-stats">
        <div className="ostat">
          <b>{active.length}</b>
          <span>en cours</span>
        </div>
        <div className="ostat">
          <b>{orders.filter((o) => o.paid).length}</b>
          <span>payées en ligne</span>
        </div>
        <div className="ostat">
          <b>{fmt(orders.filter((o) => o.status !== 'annulee').reduce((s, o) => s + (o.total || 0), 0))}</b>
          <span>chiffre d&apos;affaires (100 dernières)</span>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="admin-panel">
          <p className="ap-empty">Aucune commande pour l&apos;instant. Elles apparaîtront ici automatiquement.</p>
        </div>
      )}

      {orders.length > 0 && needle && visible.length === 0 && (
        <div className="admin-panel">
          <p className="ap-empty">Aucune commande ne correspond à « {search.trim()} ».</p>
        </div>
      )}

      {visible.map((o) => (
        <div className={`order-card st-${o.status}`} key={o.id}>
          <div className="oc-head">
            <b className="oc-num">{o.num}</b>
            <span className="oc-time">{timeFmt(o.createdAt)}</span>
            <span className="oc-mode">
              <Icon name={MODE_LABELS[o.mode]?.icon || 'bag'} size={13} /> {MODE_LABELS[o.mode]?.label || o.mode}
            </span>
            <span className={`chip ${o.paid ? 'green' : 'neutral'}`}>{o.paid ? 'Payée en ligne' : 'Paiement à la réception'}</span>
          </div>

          <div className="oc-items">
            {o.items.map((it) => (
              <span key={it.id}>
                {it.qty}× {it.name}
              </span>
            ))}
          </div>

          <div className="oc-totals">
            <span>Sous-total {fmt(o.subtotal)}</span>
            {o.discount > 0 && <span>Code {o.promoCode} −{fmt(o.discount)}</span>}
            {o.fee > 0 && <span>Livraison {fmt(o.fee)}</span>}
            <b>Total {fmt(o.total)}</b>
          </div>

          <div className="oc-customer">
            <span>
              <Icon name="phone" size={12} /> <a href={`tel:${o.customer?.phone}`}>{o.customer?.phone}</a>
              {o.customer?.name ? ` — ${o.customer.name}` : ''}
            </span>
            {o.customer?.address && <span><Icon name="pin" size={12} /> {o.customer.address}</span>}
            {(() => {
              const c = o.customer;
              const dl = [
                c?.building && `Bât. ${c.building}`,
                c?.door && `Porte ${c.door}`,
                c?.accessCode && `Code ${c.accessCode}`,
                c?.intercom && `Interphone ${c.intercom}`,
                c?.floor && `Étage ${c.floor}`,
              ].filter(Boolean) as string[];
              return dl.length ? <span><Icon name="pin" size={12} /> {dl.join(' · ')}</span> : null;
            })()}
            {o.customer?.note && <span className="oc-note">« {o.customer.note} »</span>}
          </div>

          <div className="oc-actions">
            <select
              value={o.status}
              onChange={(e) => set(o, { status: e.target.value as OrderStatus })}
              aria-label="Statut de la commande"
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            {!o.paid && (
              <button className="btn btn-ghost small" onClick={() => set(o, { paid: true })}>
                <Icon name="check" size={13} /> Marquer payée
              </button>
            )}
            <button
              className="btn btn-ghost small"
              onClick={() => printTicket(o, loc?.name || 'My Chicken', loc ? `${loc.address}, ${loc.postal} ${loc.city}` : '')}
              title="Imprimer le ticket cuisine"
            >
              <Icon name="arrowUp" size={13} style={{ transform: 'rotate(180deg)' }} /> Ticket
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
