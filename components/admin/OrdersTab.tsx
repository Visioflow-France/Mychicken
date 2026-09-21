'use client';

import Icon, { type IconName } from '@/components/Icon';
import { useOrders } from '@/lib/orders-store';
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

export default function OrdersTab() {
  const { orders, source } = useOrders();

  const set = (o: Order, patch: { status?: OrderStatus; paid?: boolean }) =>
    patchOrder(o.id, patch).catch((e) => console.error(e));

  const active = orders.filter((o) => o.status !== 'terminee' && o.status !== 'annulee');

  return (
    <div className="admin-stack">
      {source === 'demo' && (
        <p className="ap-help">
          Mode démo : seules les commandes passées depuis ce navigateur apparaissent. Avec Firebase, toutes les
          commandes de tous les clients arrivent ici en temps réel.
        </p>
      )}

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

      {orders.map((o) => (
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
          </div>
        </div>
      ))}
    </div>
  );
}
