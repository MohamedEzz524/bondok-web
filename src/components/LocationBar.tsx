'use client';

/* Shared "Choose a Location" bar (teal, offers-page style). Opens the
   location/order popup on both the menu and offers pages. */

import { useUI } from './ui-context';

export default function LocationBar({ fullBleed = false }: { fullBleed?: boolean }) {
  const { openOrder } = useUI();
  return (
    <div className={`offers-locbar${fullBleed ? ' offers-locbar-bleed' : ''}`}>
      <div className="offers-locbar-inner">
        <button className="loc-bar-btn" onClick={() => openOrder('pickup')}>
          <p className="offers-loc-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            Choose a Location
          </p>
          <p className="offers-loc-sub">For availability and prices</p>
        </button>
        <button className="offers-loc-link" onClick={() => openOrder('pickup')}>See Branches</button>
      </div>
    </div>
  );
}
