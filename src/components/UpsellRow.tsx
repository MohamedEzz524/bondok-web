'use client';

/* Compact suggestion row - "Frequently bought together" / "Complete your meal".
   One-tap add; the cart source tag lets analytics attribute upsell revenue. */

import type { Product } from '@/lib/menu-data';
import { useCart } from './cart-context';

interface Props {
  title: string;
  products: Product[];
  source: string;        // e.g. 'upsell-product-page' | 'upsell-bag'
}

export default function UpsellRow({ title, products, source }: Props) {
  const { add } = useCart();
  if (products.length === 0) return null;

  return (
    <section className="upsell" aria-label={title}>
      <h3>{title}</h3>
      <div className="upsell-row">
        {products.map((p) => (
          <div key={p.slug} className="upsell-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.name} loading="lazy" />
            <span className="upsell-name">{p.name}</span>
            {p.price !== undefined && <span className="upsell-price">EGP {p.price}</span>}
            <button
              className="upsell-add"
              aria-label={`Add ${p.name} to bag`}
              onClick={() => add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, source)}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
