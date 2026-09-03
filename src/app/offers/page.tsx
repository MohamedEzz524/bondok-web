import type { Metadata } from 'next';
import Link from 'next/link';
import { offers } from '@/lib/offers';

export const metadata: Metadata = { title: 'Offers — Bondok Fried Chicken' };

/* data-driven: client offers drop into lib/offers.ts and render here */
export default function Page() {
  return (
    <div className="offers-page">
      <div className="menu-head">
        <h1>Offers</h1>
        <p>Hot deals and limited-time offers.</p>
      </div>
      {offers.length === 0 ? (
        <div className="stub-page offers-empty">
          <svg viewBox="0 0 24 24" width="52" height="52" aria-hidden="true">
            <path fill="#e09344" d="M20.6 11 13 3.4A2 2 0 0 0 11.6 3H5a2 2 0 0 0-2 2v6.6a2 2 0 0 0 .6 1.4L11.2 20.6a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8zM7.5 8A1.5 1.5 0 1 1 7.5 5a1.5 1.5 0 0 1 0 3z" />
          </svg>
          <h2>Offers are cooking</h2>
          <p>The first Bondok offers land here soon. Meanwhile, the menu is always a good idea.</p>
          <Link href="/menu" className="btn btn-solid">Explore the Menu</Link>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.map((o) => (
            <Link key={o.id} href={o.href} className="offer-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image} alt={o.title} loading="lazy" />
              <div className="offer-body">
                <h2>{o.title}</h2>
                <p>{o.text}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
