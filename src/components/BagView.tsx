'use client';

/* Cart page - designer layout (step 1 of checkout).
   Prices render as pending until client menu data arrives. */

import Link from 'next/link';
import { useCart } from './cart-context';
import { suggestForCart, FREE_DELIVERY_THRESHOLD } from '@/lib/upsell';
import CheckoutSteps from './CheckoutSteps';
import { useState } from 'react';

const fmt = (v: number | null | undefined) => (v == null ? '—' : `EGP ${v}`);

export default function BagView() {
  const { items, count, subtotal, add, setQty, remove } = useCart();
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const suggestions = suggestForCart(items.map((i) => i.slug), 4);

  const applyPromo = () => {
    if (!promo.trim()) return;
    setPromoMsg('Promo codes activate with the offers engine at launch.');
  };

  if (items.length === 0) {
    return (
      <div className="co-page">
        <CheckoutSteps current={0} />
        <div className="co-empty">
          <h1>Your cart</h1>
          <p>Good food, good mood! Your cart is empty - let&apos;s fix that.</p>
          <Link href="/menu" className="btn btn-solid co-empty-btn">Explore the Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <CheckoutSteps current={0} />

      <div className="co-headrow">
        <div>
          <h1>Your cart</h1>
          <p className="co-subline">
            Good food, good mood!
            <span className="co-subline-sel"><span className="pg-dot" aria-hidden="true" />{count} item{count > 1 ? 's' : ''} selected</span>
          </p>
        </div>
        <span className="co-prep-chip">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--orange)" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path strokeLinecap="round" d="M12 9.5V13l2.5 1.5M9 2h6" /></svg>
          Average prep time: 12 mins
        </span>
      </div>

      <div className="co-layout">
        <div className="co-items">
          {items.map((it) => (
            <article key={it.slug} className="co-item">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="co-item-img" src={it.image} alt="" />
              <div className="co-item-main">
                <div className="co-item-toprow">
                  <div>
                    <h3>{it.name}</h3>
                    <p className="co-item-desc">Customizations arrive with menu options</p>
                  </div>
                  <div className="co-item-price">
                    <strong>{fmt(it.price != null ? it.price * it.qty : null)}</strong>
                    <span>{it.price != null ? `EGP ${it.price} / ea` : 'price with menu data'}</span>
                  </div>
                </div>
                <div className="co-item-botrow">
                  <span className="co-qty">
                    <button aria-label="Decrease quantity" onClick={() => setQty(it.slug, it.qty - 1, 'cart-page')}>−</button>
                    <b>{it.qty}</b>
                    <button className="co-qty-plus" aria-label="Increase quantity" onClick={() => setQty(it.slug, it.qty + 1, 'cart-page')}>+</button>
                  </span>
                  <span className="co-item-actions">
                    <Link className="co-edit" href="/menu" title="Edit options (menu customization)">
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4L20 8l-4-4L4 16v4zM13 7l4 4" /></svg>
                      Edit
                    </Link>
                    <button className="co-trash" aria-label={`Remove ${it.name}`} onClick={() => remove(it.slug, 'cart-page')}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13M10 11v6m4-6v6" /></svg>
                    </button>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="co-summary">
          <div className="co-summary-head">
            <h3>Order Summary</h3>
            <span className="co-chip">{count} items</span>
          </div>
          <p className="co-sumrow"><span>Subtotal</span><strong>{fmt(subtotal)}</strong></p>
          <p className="co-sumrow"><span>Delivery Fee ⓘ</span><strong>with branch data</strong></p>
          <p className="co-sumrow co-sumrow-promo">
            <span>
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinejoin="round" d="m12 2 9 9-10 10-9-9V2h10z" /><circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" stroke="none" /></svg>
              Free delivery promo over EGP {FREE_DELIVERY_THRESHOLD}
            </span>
            <strong>− EGP 0</strong>
          </p>
          <div className="co-total">
            <div>
              <p className="co-total-label">Total</p>
              <p className="co-total-sub">Inclusive of all local taxes</p>
            </div>
            <p className="co-total-num">{fmt(subtotal)}</p>
          </div>
          <Link href="/checkout" className="btn btn-solid co-cta">
            Proceed to Shipping
            <svg viewBox="0 0 54 54" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
          </Link>
          <p className="co-infobar">Delivery in 25-40 min to your doorstep</p>
          <div className="co-voucher">
            <p className="co-voucher-label">Have a voucher code?</p>
            <div className="co-voucher-row">
              <input
                placeholder="Enter promo code" value={promo}
                onChange={(e) => setPromo(e.target.value)}
                aria-label="Promo code"
              />
              <button onClick={applyPromo}>Apply</button>
            </div>
            {promoMsg && <p className="co-voucher-msg">{promoMsg}</p>}
          </div>
          <p className="co-secure">
            <span>🔒 Encrypted Checkout</span>·<span>✓ Contactless Handover</span>
          </p>
        </aside>
      </div>

      {suggestions.length > 0 && (
        <section className="co-upsell">
          <div className="co-upsell-head">
            <div>
              <h2>Complete your meal</h2>
              <p className="pg-sub">Pair your selection with these fan favorites</p>
            </div>
            <Link href="/menu" className="co-viewmenu">
              View full menu
              <svg viewBox="0 0 54 54" width="12" height="12" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
            </Link>
          </div>
          <div className="co-upsell-grid">
            {suggestions.map((p) => (
              <article key={p.slug} className="co-upsell-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} loading="lazy" />
                <h4>{p.name}</h4>
                <div className="co-upsell-foot">
                  <strong>{p.price != null ? `EGP ${p.price}` : '—'}</strong>
                  <button
                    className="co-upsell-add"
                    aria-label={`Add ${p.name} to cart`}
                    onClick={() => add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, 'cart-upsell')}
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
