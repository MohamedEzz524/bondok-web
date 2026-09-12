import Link from 'next/link';

/* Homepage "Explore Our Collections" — 4 designed category cards (title + arrow
   baked into the art) linking into the menu. */
const collections = [
  { title: 'Fried Chicken', image: '/bondok/home/collection-chicken.webp', href: '/menu/meals' },
  { title: 'Wraps', image: '/bondok/home/collection-wraps.webp', href: '/menu/rolls' },
  { title: 'Sides & Sauces', image: '/bondok/home/collection-sides.webp', href: '/menu/sides' },
  { title: 'Kids Meal', image: '/bondok/home/collection-kids.webp', href: '/menu/kids-tenders' },
];

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
);

export default function FeatureCards() {
  return (
    <section className="home-sec collections">
      <div className="sec-head">
        <h2>Explore Our Collections</h2>
        <p>Find your favorite flavor, from crispy chicken to tasty sides.</p>
        <Link href="/menu" className="sec-viewall">View All <Arrow /></Link>
      </div>
      <div className="collections-grid">
        {collections.map((c) => (
          <Link key={c.title} href={c.href} className="collection-card" aria-label={c.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.title} loading="lazy" />
          </Link>
        ))}
      </div>
    </section>
  );
}
