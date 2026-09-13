'use client';

/* Free-gift progress bar for the cart. Uses the priced (non-gift) subtotal;
   silent until the cart has real prices. When the threshold is reached the
   cart-context auto-adds the free gift line and this flips to "unlocked". */

import { useCart } from './cart-context';
import { FREE_GIFT, FREE_GIFT_THRESHOLD } from '@/lib/upsell';

const GIFT_LABEL = FREE_GIFT.name.replace(/^Free\s+/i, '');

export default function GiftBar() {
  const { subtotal, count } = useCart();

  if (count === 0 || subtotal === null || subtotal === 0) return null;

  const remaining = Math.max(0, FREE_GIFT_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_GIFT_THRESHOLD) * 100));
  const unlocked = remaining === 0;

  return (
    <div className={`giftbar${unlocked ? ' is-unlocked' : ''}`} role="status">
      <p>
        <span className="giftbar-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 7h-2.2a3 3 0 0 0-4.3-3.8L12 4.3l-1.5-1.1A3 3 0 0 0 6.2 7H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1zm-5.6-2.2a1 1 0 0 1 1.4 1.4L14.6 7H13zM9.2 4.5a1 1 0 0 1 1.4 0L11 7H9.4l-.2-.3a1 1 0 0 1 0-2.2zM11 19H6v-7h5zm0-9H5V9h6zm7 9h-5v-7h5zm1-9h-6V9h6z" /></svg>
        </span>
        {unlocked
          ? <>Unlocked! A free <strong>{GIFT_LABEL}</strong> is on us.</>
          : <>Spend <strong>EGP {remaining}</strong> more to get a free <strong>{GIFT_LABEL}</strong>.</>}
      </p>
      <div className="giftbar-track" aria-hidden="true"><span className="giftbar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
