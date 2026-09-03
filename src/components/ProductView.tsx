'use client';

/* Full product page body - the canonical ad/SEO landing surface.
   Same content structure as the in-menu popup, laid out as a page. */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MenuCategory, Product } from '@/lib/menu-data';
import { useCart } from './cart-context';
import { usePrefs } from './prefs-context';
import FavButton from './FavButton';

interface Props {
  category: MenuCategory;
  product: Product;
  variants: Product[] | null;
}

const sizeLabel = { single: 'Single', double: 'Double', triple: 'Triple' } as const;

export default function ProductView({ category, product, variants }: Props) {
  const { add } = useCart();
  const { recordView } = usePrefs();
  const [qty, setQty] = useState(1);

  useEffect(() => { recordView(product.slug); }, [product.slug, recordView]);

  const addToBag = () => {
    for (let i = 0; i < qty; i++) {
      add({ slug: product.slug, name: product.name, image: product.image, price: product.price }, 'product-page');
    }
  };

  return (
    <div className="product-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/menu">Menu</Link>
        <span>/</span>
        <Link href={`/menu?cat=${category.slug}`}>{category.name}</Link>
        <span>/</span>
        <strong>{product.name}</strong>
      </nav>

      <div className="product-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="product-hero-img" src={product.image} alt={product.name} />
        <div className="product-hero-info">
          <div className="pmodal-titlerow product-titlerow">
            <h1>{product.name}</h1>
            <FavButton slug={product.slug} size={24} />
          </div>
          {product.price !== undefined && <p className="pmodal-price">EGP {product.price}</p>}
          <p className="product-hero-desc">
            {product.description ?? category.blurb}
          </p>

          {variants && (
            <div className="pmodal-variants product-page-variants" role="group" aria-label="Choose size">
              {variants.map((v) => (
                <Link
                  key={v.slug}
                  href={`/menu/${category.slug}/${v.slug}`}
                  className={`fchip${v.slug === product.slug ? ' is-on' : ''}`}
                >
                  {v.size ? sizeLabel[v.size] : v.name}
                </Link>
              ))}
            </div>
          )}

          <div className="product-hero-actions">
            <div className="bag-qty" aria-label="Quantity">
              <button aria-label="Decrease quantity" onClick={() => setQty((n) => Math.max(1, n - 1))}>−</button>
              <span>{qty}</span>
              <button aria-label="Increase quantity" onClick={() => setQty((n) => n + 1)}>+</button>
            </div>
            <button className="btn btn-solid pmodal-add" onClick={addToBag}>
              Add {qty > 1 ? `${qty} ` : ''}to Bag
              {product.price !== undefined && ` · EGP ${product.price * qty}`}
            </button>
          </div>

          <div className="pmodal-section">
            <h3>Additional Information</h3>
            <p>Product availability, prices, offers and discounts may vary per branch. All pictures are shown for illustrative purposes only - actual product may vary.</p>
          </div>
        </div>
      </div>

      <div className="product-more">
        <h2>More from {category.name}</h2>
        <div className="menu-grid">
          {category.products.filter((p) => p.slug !== product.slug).slice(0, 4).map((p) => (
            <Link key={p.slug} href={`/menu/${category.slug}/${p.slug}`} className="product-card">
              <div className="product-imgwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} loading="lazy" />
              </div>
              <div className="product-body">
                <h3>{p.name}</h3>
                {p.price !== undefined && <span className="product-price">EGP {p.price}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
