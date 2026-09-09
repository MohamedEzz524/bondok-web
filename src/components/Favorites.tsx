/* Crowd favorites - a static grid of 4 (no carousel). */

import Link from 'next/link';
import { favorites } from '@/lib/data';

export default function Favorites() {
  const shown = favorites.slice(0, 4);
  return (
    <section className="favorites">
      <div className="favorites-head">
        <h4>Try out our crowd favorites</h4>
      </div>
      <div className="favorites-grid">
        {shown.map((f) => (
          <Link key={f.title} className="fav-card" href={f.href}>
            <div className="fav-imgwrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="fav-photo" src={f.image} alt={f.alt} />
            </div>
            <div className="fav-title">{f.title}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
