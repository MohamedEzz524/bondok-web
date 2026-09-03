'use client';

import { useUI } from './ui-context';

export default function OrderButtons() {
  const { openOrder } = useUI();

  return (
    <section className="order-row">
      <div className="order-cell">
        <button className="btn btn-solid order-btn" onClick={() => openOrder('pickup')}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
          Order Pickup
        </button>
      </div>
      <div className="order-cell">
        <button className="btn btn-solid order-btn" onClick={() => openOrder('delivery')}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M3 13h13v-2H3v2zm0 4h13v-2H3v2zm15-1 3-3-3-3v2h-2v2h2v2zM3 9h10V7H3v2z" />
          </svg>
          Order Delivery
        </button>
      </div>
    </section>
  );
}
