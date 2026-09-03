import type { Metadata } from 'next';
import Link from 'next/link';
import { offers } from '@/lib/offers';

export const metadata: Metadata = { title: 'Offers — Bondok Fried Chicken' };

/* structure follows the reference offers page; data-driven from lib/offers.ts */
export default function Page() {
  const hasSamples = offers.some((o) => o.sample);

  return (
    <div className="offers-page">
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
          <button className="btn btn-solid">Sign Up</button>
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

      {hasSamples && (
        <div className="branches-note">
          Sample offers showing the page structure - real Bondok campaigns replace these.
        </div>
      )}

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
            <div className="offer-foot">
              <span className="offer-price">{o.fromPrice !== undefined ? `from EGP ${o.fromPrice}` : ''}</span>
              {o.mode && (
                <span className={`offer-mode${o.mode === 'pickup' ? ' is-pickup' : ''}`}>
                  {o.mode === 'pickup' ? 'Pick Up' : 'Delivery'}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
