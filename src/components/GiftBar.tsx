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
        {unlocked
          ? <>🎁 Unlocked! A free <strong>{GIFT_LABEL}</strong> is on us.</>
          : <>Spend <strong>EGP {remaining}</strong> more to get a free <strong>{GIFT_LABEL}</strong> 🎁</>}
      </p>
      <div className="giftbar-track" aria-hidden="true"><span className="giftbar-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
