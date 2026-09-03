'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './cart-context';
import { EVENTS, publish } from '@/lib/pubsub';
import CloseIcon from './CloseIcon';
import RecentlyViewed from './RecentlyViewed';
import UpsellRow from './UpsellRow';
import FreeDeliveryBar from './FreeDeliveryBar';
import { suggestForCart } from '@/lib/upsell';

export default function BagView() {
  const { items, count, subtotal, setQty, remove, clear } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="stub-page">
        <h1>Your Bag</h1>
        <p>Your bag is empty. Explore the menu and add your favorites.</p>
        <Link href="/menu" className="btn btn-solid">Explore the Menu</Link>
      </div>
    );
  }

  return (
    <div className="bag-page">
      <div className="bag-head">
        <h1>Your Bag</h1>
        <p>{count} item{count === 1 ? '' : 's'}</p>
      </div>

      <FreeDeliveryBar />

      <ul className="bag-list">
        {items.map((i) => (
          <li key={i.slug} className="bag-item">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i.image} alt={i.name} />
            <div className="bag-item-info">
              <h3>{i.name}</h3>
              <span className="bag-item-price">
                {i.price !== undefined ? `EGP ${i.price * i.qty}` : 'Price soon'}
              </span>
            </div>
            <div className="bag-qty" aria-label={`Quantity of ${i.name}`}>
              <button aria-label="Decrease quantity" onClick={() => setQty(i.slug, i.qty - 1, 'bag-page')}>−</button>
              <span>{i.qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty(i.slug, i.qty + 1, 'bag-page')}>+</button>
            </div>
            <button className="bag-remove icon-btn" aria-label={`Remove ${i.name}`} onClick={() => remove(i.slug, 'bag-page')}>
              <CloseIcon size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="bag-summary">
        <div className="bag-summary-row">
          <span>Subtotal</span>
          <strong>{subtotal === null ? 'Prices arrive with menu data' : `EGP ${subtotal}`}</strong>
        </div>
        <p className="bag-note">Delivery fees are calculated at checkout based on your branch and address.</p>
        <div className="bag-actions">
          <button className="btn btn-outline" onClick={() => clear('bag-page')}>Clear Bag</button>
          <button
            className="btn btn-solid"
            onClick={() => {
              publish(EVENTS.checkoutStart, { source: 'bag-page', count });
              router.push('/checkout');
            }}
          >
            Checkout
          </button>
        </div>
      </div>
      <UpsellRow title="Complete your meal" products={suggestForCart(items.map((i) => i.slug))} source="upsell-bag" />
      <RecentlyViewed title="You recently viewed" />
    </div>
  );
}
