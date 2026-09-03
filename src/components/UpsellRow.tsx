'use client';

/* Suggestion row - two modes:
   - instant (bag): "+" adds straight to the cart
   - select (popup/product page): "+" marks the extra and becomes a qty
     stepper; extras are added TOGETHER with the main item on Add to Bag. */

import type { Product } from '@/lib/menu-data';
import { useCart } from './cart-context';

interface Props {
  title: string;
  products: Product[];
  source: string;                                   // analytics attribution tag
  selections?: Record<string, number>;              // select mode when provided
  onSelect?: (slug: string, qty: number) => void;
}

export default function UpsellRow({ title, products, source, selections, onSelect }: Props) {
  const { add } = useCart();
  if (products.length === 0) return null;
  const selectMode = selections !== undefined && onSelect !== undefined;

  return (
    <section className="upsell" aria-label={title}>
      <h3>{title}</h3>
      <div className="upsell-row">
        {products.map((p) => {
          const qty = selectMode ? (selections[p.slug] ?? 0) : 0;
          return (
            <div key={p.slug} className={`upsell-card${qty > 0 ? ' is-selected' : ''}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={p.name} loading="lazy" />
              <span className="upsell-name">{p.name}</span>
              {p.price !== undefined && <span className="upsell-price">EGP {p.price}</span>}

              {selectMode ? (
                qty === 0 ? (
                  <button
                    className="upsell-add"
                    aria-label={`Add ${p.name} with your meal`}
                    onClick={() => onSelect(p.slug, 1)}
                  >
                    +
                  </button>
                ) : (
                  <div className="upsell-qty" aria-label={`Quantity of ${p.name}`}>
                    <button aria-label="Decrease" onClick={() => onSelect(p.slug, qty - 1)}>−</button>
                    <span>{qty}</span>
                    <button aria-label="Increase" onClick={() => onSelect(p.slug, qty + 1)}>+</button>
                  </div>
                )
              ) : (
                <button
                  className="upsell-add"
                  aria-label={`Add ${p.name} to bag`}
                  onClick={() => add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, source)}
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
