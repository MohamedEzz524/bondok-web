import type { Metadata } from 'next';
import Link from 'next/link';
import { offers } from '@/lib/offers';

export const metadata: Metadata = { title: 'Offers — Bondok Fried Chicken' };

/* structure + geometry cloned from the reference offers page; data-driven
   from lib/offers.ts (sample campaigns until the client's real ones) */
export default function Page() {
  const hasSamples = offers.some((o) => o.sample);

  return (
    <div className="offers-page">
      {/* teal location banner (reference: prompts branch choice for pricing) */}
      <div className="offers-locbar">
        <div className="offers-locbar-inner">
          <div>
            <p className="offers-loc-title">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
              </svg>
              Choose a Location
            </p>
            <p className="offers-loc-sub">For availability and prices</p>
          </div>
          <Link href="/branches" className="offers-loc-link">See Branches</Link>
        </div>
      </div>

      <div className="offers-body">
        {/* sign-up promo banner */}
        <div className="offers-signup">
          <div className="offers-signup-top">
            <p>Want tasty deals? <strong>Sign up!</strong></p>
            <Link href="/rewards" className="offers-learn">Learn More</Link>
          </div>
          <div className="offers-signup-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bondok/fav-tenders.webp" alt="" />
            <div className="offers-signup-text">
              <strong>Your first deal is on us</strong>
              <span>Members get exclusive offers and early access to new meals.</span>
            </div>
            <button className="btn btn-solid offers-signup-btn">Sign Up</button>
          </div>
        </div>

        {/* heading row */}
        <div className="offers-headrow">
          <div>
            <h1>Offers</h1>
            <p>Prices and availability vary by branch.</p>
          </div>
          <button className="offers-promo-link">Have a Promo Code?</button>
        </div>

        {/* offers grid */}
        <div className="offers-grid">
          {offers.map((o) => (
            <Link key={o.id} href={o.href} className="offer-card">
              {o.badge && <span className="offer-badge">{o.badge}</span>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image} alt={o.title} loading="lazy" />
              <div className="offer-body">
                <h2>{o.title}</h2>
                <p>{o.text}</p>
              </div>
              {(o.fromPrice !== undefined || o.mode) && (
                <div className="offer-foot">
                  <span className="offer-price">{o.fromPrice !== undefined ? `from EGP ${o.fromPrice}` : ''}</span>
                  {o.mode && (
                    <span className={`offer-mode${o.mode === 'pickup' ? ' is-pickup' : ''}`}>
                      {o.mode === 'pickup' ? 'Pick Up' : 'Delivery'}
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>

        {hasSamples && (
          <p className="offers-sample-note">
            Sample offers showing the page structure - real Bondok campaigns replace these.
          </p>
        )}
      </div>
    </div>
  );
}
