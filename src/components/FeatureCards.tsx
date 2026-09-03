import Link from 'next/link';
import { featureCards } from '@/lib/data';

export default function FeatureCards() {
  return (
    <section className="features">
      <div className="features-grid">
        {featureCards.map((c) => (
          <article key={c.title} className="feature-card">
            <Link className="feature-media" href={c.href}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.alt} />
            </Link>
            <div className="feature-body">
              <div>
                <h2>{c.title}</h2>
                <div className="feature-text">{c.text}</div>
              </div>
              <div className="feature-cta">
                <Link href={c.href} className="btn btn-outline">{c.cta}</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
