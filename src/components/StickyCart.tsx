'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from './cart-context';

export default function StickyCart() {
  const { count, subtotal } = useCart();
  const pathname = usePathname();

  /* hidden when empty or already on the bag page */
  if (count === 0 || pathname === '/bag') return null;

  return (
    <Link href="/bag" className="sticky-cart" aria-label={`View bag, ${count} items`}>
      <span className="sticky-cart-count">{count}</span>
      <span className="sticky-cart-label">View Bag</span>
      <span className="sticky-cart-total">
        {subtotal === null ? 'prices soon' : subtotal === 0 ? '' : `EGP ${subtotal}`}
      </span>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z" />
      </svg>
    </Link>
  );
}
