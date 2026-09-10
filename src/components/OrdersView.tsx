'use client';

/* Order history (demo) — lists orders saved in localStorage, newest first. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders, STATUS_STEPS, type Order } from '@/lib/orders';

const statusLabel = (s: Order['status']) => STATUS_STEPS.find((x) => x.key === s)?.label ?? s;

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => { setOrders(getOrders()); }, []);

  if (orders === null) return <div className="ord-page"><p className="ord-loading">Loading…</p></div>;

  if (orders.length === 0) {
    return (
      <div className="ord-page ord-missing">
        <h1>No orders yet</h1>
        <p>Your past orders will show up here once you place one.</p>
        <Link href="/menu" className="btn btn-solid">Start an order</Link>
      </div>
    );
  }

  return (
    <div className="ord-page">
      <header className="ord-listhead">
        <p className="pg-eyebrow"><span className="pg-dot" aria-hidden="true" />Your account</p>
        <h1>Order history</h1>
      </header>
      <div className="ord-list">
        {orders.map((o) => (
          <Link key={o.id} href={`/order?id=${o.id}`} className="ord-row">
            <div className="ord-row-main">
              <p className="ord-row-id">#{o.id}</p>
              <p className="ord-row-meta">
                {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {' · '}{o.items.reduce((n, i) => n + i.qty, 0)} item{o.items.length > 1 ? 's' : ''}
                {' · '}{o.mode === 'pickup' ? 'Pickup' : 'Delivery'}
              </p>
            </div>
            <div className="ord-row-right">
              <span className={`ord-chip ord-chip-${o.status}`}>{statusLabel(o.status)}</span>
              <strong>EGP {o.total}</strong>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
