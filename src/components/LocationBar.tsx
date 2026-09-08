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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/Icon-location.svg" alt="" width="15" height="18" />
            Choose a Location
          </p>
          <p className="offers-loc-sub">For availability and prices</p>
        </button>
        <button className="offers-loc-link" onClick={() => openOrder('pickup')}>See Branches</button>
      </div>
    </div>
  );
}
