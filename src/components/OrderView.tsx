'use client';

/* Order confirmation + demo live tracking. Reads ?id= and looks the order up in
   localStorage (survives refresh). The status advances over time (liveStatusIndex)
   to fake a live kitchen -> delivery flow. */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrder, STATUS_STEPS, liveStatusIndex, type Order } from '@/lib/orders';

const fmt = (v: number) => `EGP ${v}`;

export default function OrderView() {
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => { setOrder(id ? getOrder(id) : null); }, [id]);

  useEffect(() => {
    if (!order) return;
    const tick = () => setStepIdx(liveStatusIndex(order, Date.now()));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, [order]);

  if (order === undefined) return <div className="ord-page"><p className="ord-loading">Loading your order…</p></div>;

  if (!order) {
    return (
      <div className="ord-page ord-missing">
        <h1>Order not found</h1>
        <p>We couldn’t find that order on this device.</p>
        <Link href="/orders" className="btn btn-solid">View your orders</Link>
      </div>
    );
  }

  const placed = new Date(order.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const steps = order.mode === 'pickup'
    ? STATUS_STEPS.map((s) => (s.key === 'on-the-way' ? { ...s, label: 'Ready soon' } : s.key === 'delivered' ? { ...s, label: 'Picked up' } : s))
    : STATUS_STEPS;

  return (
    <div className="ord-page">
      <header className="ord-hero">
        <span className="ord-check" aria-hidden="true">✓</span>
        <p className="pg-eyebrow"><span className="pg-dot" aria-hidden="true" />Order {order.status === 'delivered' ? 'complete' : 'confirmed'}</p>
        <h1>Thanks{order.name ? `, ${order.name.split(' ')[0]}` : ''}!</h1>
        <p className="ord-sub">Order <strong>#{order.id}</strong> · placed {placed}</p>
      </header>

      {/* live tracking */}
      <section className="ord-track">
        <div className="ord-track-head">
          <h2>{order.mode === 'pickup' ? 'Pickup status' : 'Delivery status'}</h2>
          <span className="ord-eta">ETA {order.eta}</span>
        </div>
        <ol className="ord-steps">
          {steps.map((s, i) => (
            <li key={s.key} className={`ord-step${i < stepIdx ? ' is-done' : ''}${i === stepIdx ? ' is-active' : ''}`}>
              <span className="ord-step-dot" aria-hidden="true" />
              <span className="ord-step-label">{s.label}</span>
            </li>
          ))}
        </ol>
        <p className="ord-demo-note">Live tracking is simulated for this demo.</p>
      </section>

      <div className="ord-grid">
        {/* receipt */}
        <section className="ord-card">
          <h2>Your order</h2>
          <ul className="ord-items">
            {order.items.map((it) => (
              <li key={it.slug + (it.options?.join('') ?? '')} className="ord-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt="" />
                <div>
                  <p className="ord-item-name">{it.qty}× {it.name}</p>
                  {it.options?.length ? <p className="ord-item-opts">{it.options.join(' · ')}</p> : null}
                </div>
                <span className="ord-item-price">{it.isGift ? 'FREE' : fmt((it.price ?? 0) * it.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="ord-totals">
            <div><dt>Subtotal</dt><dd>{fmt(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="ord-total-discount"><dt>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt><dd>− {fmt(order.discount)}</dd></div>}
            {order.pointsUsed ? <div className="ord-total-discount"><dt>Points ({order.pointsUsed} pts)</dt><dd>− {fmt(order.pointsUsed / 10)}</dd></div> : null}
            <div><dt>{order.mode === 'pickup' ? 'Pickup' : 'Delivery'}</dt><dd>{order.deliveryFee ? fmt(order.deliveryFee) : 'Free'}</dd></div>
            <div className="ord-total"><dt>Total</dt><dd>{fmt(order.total)}</dd></div>
          </dl>
        </section>

        {/* details */}
        <section className="ord-card">
          <h2>Details</h2>
          <div className="ord-detail"><span>{order.mode === 'pickup' ? 'Pickup from' : 'Deliver to'}</span><strong>{order.mode === 'pickup' ? (order.branch ?? 'Selected branch') : (order.address ?? '—')}</strong></div>
          <div className="ord-detail"><span>Contact</span><strong>+20 {order.phone}</strong></div>
          <div className="ord-detail"><span>Payment</span><strong>{order.payment === 'cod' ? 'Cash on delivery' : order.payment === 'wallet' ? 'Wallet' : 'Card'}</strong></div>
          <div className="ord-actions">
            <Link href="/orders" className="btn btn-outline">All orders</Link>
            <Link href="/menu" className="btn btn-solid">Order again</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
