'use client';

/* Free-delivery progress bar. Activates automatically once cart items carry
   real prices (subtotal !== null); silent until then. Threshold is
   CMS-configurable later. */

import { useCart } from './cart-context';
import { FREE_DELIVERY_THRESHOLD } from '@/lib/upsell';

export default function FreeDeliveryBar() {
  const { subtotal, count } = useCart();

  /* no prices yet (client menu data pending) or empty bag: render nothing */
  if (count === 0 || subtotal === null || subtotal === 0) return null;

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <div className="fdbar" role="status">
      <p>
        {remaining === 0
          ? 'You unlocked FREE delivery! 🎉'
          : <>Add <strong>EGP {remaining}</strong> more for free delivery</>}
      </p>
      <div className="fdbar-track" aria-hidden="true">
        <span className="fdbar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
