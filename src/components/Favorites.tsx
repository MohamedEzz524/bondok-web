'use client';

/* Homepage "Our Most Wanted" — crowd-favorite products with branch price +
   add-to-cart + favourite, matching the site's branch-pricing model. */

import Link from 'next/link';
import { useCatalog } from './catalog-context';
import { useCart } from './cart-context';
import FavButton from './FavButton';

const wanted = [
  { slug: 'bondok-meal', name: 'Bondok Meal', image: '/bondok/menu/meals/bondok-meal.webp', href: '/menu/meals/bondok-meal' },
  { slug: '12-pcs-tenders', name: '12 Pcs Tenders', image: '/bondok/menu/kids-tenders/12-pcs-tenders.webp', href: '/menu/kids-tenders/12-pcs-tenders' },
  { slug: 'shrimp-roll', name: 'Shrimp Roll', image: '/bondok/menu/rolls/shrimp-roll.webp', href: '/menu/rolls/shrimp-roll' },
  { slug: 'cheese-fries', name: 'Cheezy Jalapeno Fries', image: '/bondok/menu/sides/cheese-fries.webp', href: '/menu/sides/cheese-fries' },
];

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>
);

export default function Favorites() {
  const { priceOf } = useCatalog();
  const { add } = useCart();

  return (
    <section className="home-sec mostwanted">
      <div className="sec-head">
        <h2>Our Most Wanted</h2>
        <p>The crowd favorites you can’t miss.</p>
        <Link href="/menu" className="sec-viewall">View All Products <Arrow /></Link>
      </div>
      <div className="mw-grid">
        {wanted.map((p) => {
          const price = priceOf(p.slug);
          return (
            <article key={p.slug} className="mw-card">
              <FavButton slug={p.slug} className="mw-fav" />
              <Link href={p.href} className="mw-media" aria-label={p.name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} loading="lazy" />
              </Link>
              <div className="mw-body">
                <Link href={p.href} className="mw-name">{p.name}</Link>
                <div className="mw-foot">
                  <span className="mw-price">{price != null ? <><span>EGP</span> {price}</> : <em>Select branch</em>}</span>
                  <button
                    className="mw-add"
                    onClick={() => add({ slug: p.slug, name: p.name, image: p.image, price }, 'home-most-wanted')}
                  >
                    <svg viewBox="0 0 42 42" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12.4509 41.5029C11.3095 41.5029 10.3325 41.0965 9.51973 40.2838C8.70697 39.471 8.30059 38.494 8.30059 37.3526C8.30059 36.2113 8.70697 35.2343 9.51973 34.4215C10.3325 33.6087 11.3095 33.2023 12.4509 33.2023C13.5922 33.2023 14.5693 33.6087 15.382 34.4215C16.1948 35.2343 16.6012 36.2113 16.6012 37.3526C16.6012 38.494 16.1948 39.471 15.382 40.2838C14.5693 41.0965 13.5922 41.5029 12.4509 41.5029ZM33.2023 41.5029C32.061 41.5029 31.084 41.0965 30.2712 40.2838C29.4584 39.471 29.052 38.494 29.052 37.3526C29.052 36.2113 29.4584 35.2343 30.2712 34.4215C31.084 33.6087 32.061 33.2023 33.2023 33.2023C34.3437 33.2023 35.3207 33.6087 36.1335 34.4215C36.9463 35.2343 37.3526 36.2113 37.3526 37.3526C37.3526 38.494 36.9463 39.471 36.1335 40.2838C35.3207 41.0965 34.3437 41.5029 33.2023 41.5029ZM10.687 8.30059L15.6674 18.6763H30.1934L35.9 8.30059H10.687ZM8.71561 4.15029H39.324C40.1195 4.15029 40.7248 4.5048 41.1398 5.21381C41.5548 5.92281 41.5721 6.64047 41.1917 7.36677L33.8249 20.6477C33.4444 21.3394 32.9343 21.8755 32.2945 22.2559C31.6546 22.6364 30.9543 22.8266 30.1934 22.8266H14.7335L12.4509 26.9769H37.3526V31.1272H12.4509C10.8945 31.1272 9.7186 30.4441 8.92313 29.078C8.12766 27.7119 8.09307 26.3544 8.81937 25.0055L11.6208 19.9214L4.15029 4.15029H0V0H6.74423L8.71561 4.15029Z" /></svg>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
