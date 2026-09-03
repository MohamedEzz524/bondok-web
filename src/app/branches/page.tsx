import type { Metadata } from 'next';
import { branches } from '@/lib/branches';

export const metadata: Metadata = {
  title: 'Our Branches — Bondok Fried Chicken',
  description: 'Find your nearest Bondok branch - locations, hotlines, working hours and delivery areas.',
};

export default function BranchesPage() {
  return (
    <div className="branches-page">
      <div className="menu-head">
        <h1>Our Branches</h1>
        <p>{branches.length} locations and growing - find the Bondok nearest to you.</p>
      </div>

      <div className="branches-note">
        Branch details (addresses, hotlines, WhatsApp, hours, delivery areas) are being
        finalized and will appear here automatically once provided.
      </div>

      <div className="branches-grid">
        {branches.map((b) => (
          <article key={b.id} className="branch-card">
            <header>
              <h2>{b.name}</h2>
              <span className="branch-area">{b.area}</span>
            </header>

            <ul className="branch-info">
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                {b.address ?? <span className="branch-pending">Address pending</span>}
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm.5-15h-2v6l5.2 3.1 1-1.6-4.2-2.5z" /></svg>
                {b.hours ?? <span className="branch-pending">Working hours pending</span>}
              </li>
              <li>
                <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M3 13h13v-2H3v2zm0 4h13v-2H3v2zm15-1 3-3-3-3v2h-2v2h2v2zM3 9h10V7H3v2z" /></svg>
                {b.deliveryAreas ?? <span className="branch-pending">Delivery coverage pending</span>}
              </li>
            </ul>

            <div className="branch-actions">
              {b.hotline ? (
                <a className="btn btn-solid" href={`tel:${b.hotline}`}>Call</a>
              ) : (
                <button className="btn btn-solid is-disabled" disabled>Call · soon</button>
              )}
              {b.whatsapp ? (
                <a className="btn btn-outline" href={`https://wa.me/${b.whatsapp}`} target="_blank" rel="noopener">WhatsApp</a>
              ) : (
                <button className="btn btn-outline is-disabled" disabled>WhatsApp · soon</button>
              )}
              {b.mapUrl ? (
                <a className="btn btn-outline" href={b.mapUrl} target="_blank" rel="noopener">Directions</a>
              ) : (
                <button className="btn btn-outline is-disabled" disabled>Map · soon</button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
