'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './cart-context';

export default function StickyCart() {
  const { count, subtotal } = useCart();
  const raw = usePathname();
  const path = raw.replace(/\/+$/, '') || '/';

  /* hidden when the cart is empty or already in checkout */
  if (count === 0 || path === '/checkout') return null;

  /* on the bag page it becomes a Checkout CTA; elsewhere it's a View Bag link */
  const onBag = path === '/bag';
  const href = onBag ? '/checkout' : '/bag';
  const label = onBag ? 'Checkout' : 'View Bag';
  /* a product page has its own mobile sticky add-bar — sit above it */
  const onPdp = /^\/menu\/[^/]+\/[^/]+$/.test(path);

  return (
    <Link href={href} className={`sticky-cart${onPdp ? ' is-pdp' : ''}`} aria-label={`${label}, ${count} items`}>
      <span className="sticky-cart-count">{count}</span>
      <span className="sticky-cart-label">{label}</span>
      <span className="sticky-cart-total">
        {subtotal === null ? 'prices soon' : subtotal === 0 ? '' : `EGP ${subtotal}`}
      </span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z" />
      </svg>
    </Link>
  );
}
