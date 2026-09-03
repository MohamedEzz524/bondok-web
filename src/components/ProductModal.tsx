'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/menu-data';
import { useCart } from './cart-context';
import CloseIcon from './CloseIcon';
import FavButton from './FavButton';
import UpsellRow from './UpsellRow';
import { suggestFor } from '@/lib/upsell';

interface Props {
  product: Product;
  /* size siblings (single/double/triple) when the product has variants */
  variants: Product[] | null;
  onSelectVariant: (p: Product) => void;
  onClose: () => void;
}

const sizeLabel = { single: 'Single', double: 'Double', triple: 'Triple' } as const;

export default function ProductModal({ product, variants, onSelectVariant, onClose }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [closing, setClosing] = useState(false);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToBag = () => {
    for (let i = 0; i < qty; i++) {
      add({ slug: product.slug, name: product.name, image: product.image, price: product.price }, 'product-modal');
    }
    close();
  };

  return (
    <div className={`pmodal-overlay${closing ? ' closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="pmodal" role="dialog" aria-label={product.name}>
        <button className="pmodal-close" aria-label="Close" onClick={close}>
          <CloseIcon size={18} />
        </button>

        <div className="pmodal-scroll">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="pmodal-img" src={product.image} alt={product.name} />
          <div className="pmodal-titlerow">
            <h2 className="pmodal-title">{product.name}</h2>
            <FavButton slug={product.slug} size={22} />
          </div>
          {product.price !== undefined && <p className="pmodal-price">EGP {product.price}</p>}

          {variants && (
            <div className="pmodal-variants" role="group" aria-label="Choose size">
              {variants.map((v) => (
                <button
                  key={v.slug}
                  className={`fchip${v.slug === product.slug ? ' is-on' : ''}`}
                  onClick={() => onSelectVariant(v)}
                >
                  {v.size ? sizeLabel[v.size] : v.name}
                </button>
              ))}
            </div>
          )}

          <div className="pmodal-section">
            <h3>Description</h3>
            <p>{product.description ?? 'Full product description arrives with the final menu data.'}</p>
          </div>

          <UpsellRow title="Frequently bought together" products={suggestFor(product.slug)} source="upsell-popup" />

          <div className="pmodal-section">
            <h3>Additional Information</h3>
            <p>Product availability, prices, offers and discounts may vary per branch. All pictures are shown for illustrative purposes only - actual product may vary.</p>
          </div>
        </div>

        <div className="pmodal-actions">
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
      </div>
    </div>
  );
}
