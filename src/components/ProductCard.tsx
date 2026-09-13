'use client';

/* Reusable product card. Two layouts that reuse existing CSS:
   - variant="vertical"   -> the homepage "Our Most Wanted" card (.mw-card)
   - variant="horizontal" -> the menu category card (.pcard)
   A `size` prop ('sm' | 'md' | 'lg') scales font/image/button/padding/radius via a
   modifier class. Toggle fav / badge / price / add per usage. Use anywhere a product
   needs a card (you-may-like, recently viewed, offers, etc.). */

import Link from 'next/link';
import { useCart } from './cart-context';
import { useUI } from './ui-context';
import FavButton from './FavButton';
import ProductBadges from './ProductBadges';
import type { Product } from '@/lib/menu-data';

interface Props {
  product: Product;
  href: string;
  variant?: 'vertical' | 'horizontal';
  size?: 'sm' | 'md' | 'lg';
  source?: string;            // cart-event source tag
  showFav?: boolean;
  showBadge?: boolean;
  showPrice?: boolean;
  showAdd?: boolean;
  addLabel?: string;
  description?: string;       // horizontal card sub-line
}

export default function ProductCard({
  product: p, href, variant = 'vertical', size = 'md', source = 'product-card',
  showFav = true, showBadge = true, showPrice = true, showAdd = true,
  addLabel, description,
}: Props) {
  const { add } = useCart();
  const { openQuickView } = useUI();
  const price = p.price;
  const onAdd = () => add({ slug: p.slug, name: p.name, image: p.image, price }, source);
  const onQuickView = () => openQuickView(p.slug);

  const priceEl = price != null
    ? <><span>EGP</span> {price}</>
    : <em>Select branch</em>;

  if (variant === 'horizontal') {
    return (
      <article className={`pcard pcx pcx-h pcx-${size}`}>
        {showBadge && <ProductBadges tags={p.tags} variant="ribbon" className="pcard-ribbon" />}
        {showFav && <FavButton slug={p.slug} className="pcard-fav" />}
        <div className="pcard-info">
          <Link href={href} className="pcard-name"><h3>{p.name}</h3></Link>
          {description && <p>{description}</p>}
          {showPrice && <span className="product-price">{price != null ? `EGP ${price}` : 'Select branch'}</span>}
          {showAdd && <button className="btn btn-solid pcard-add" onClick={onAdd}>{addLabel ?? 'Add to Bag'}</button>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href={href} className="pcard-imglink" draggable={false}><img className="pcard-img" src={p.image} alt={p.name} loading="lazy" draggable={false} /></Link>
      </article>
    );
  }

  return (
    <article className={`mw-card pcx pcx-v pcx-${size}`}>
      {showBadge && <ProductBadges tags={p.tags} variant="ribbon" className="pcx-ribbon" />}
      {showFav && <FavButton slug={p.slug} className="mw-fav" />}
      <Link href={href} className="mw-media" aria-label={p.name} draggable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={p.name} loading="lazy" draggable={false} />
      </Link>
      <div className="mw-body">
        <Link href={href} className="mw-name">{p.name}</Link>
        {(showPrice || showAdd) && (
          <div className="mw-foot">
            {showPrice && <span className="mw-price">{priceEl}</span>}
            {showAdd && (
              <button className="mw-add" onClick={onQuickView}>
                <svg viewBox="0 0 42 42" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12.4509 41.5029C11.3095 41.5029 10.3325 41.0965 9.51973 40.2838C8.70697 39.471 8.30059 38.494 8.30059 37.3526C8.30059 36.2113 8.70697 35.2343 9.51973 34.4215C10.3325 33.6087 11.3095 33.2023 12.4509 33.2023C13.5922 33.2023 14.5693 33.6087 15.382 34.4215C16.1948 35.2343 16.6012 36.2113 16.6012 37.3526C16.6012 38.494 16.1948 39.471 15.382 40.2838C14.5693 41.0965 13.5922 41.5029 12.4509 41.5029ZM33.2023 41.5029C32.061 41.5029 31.084 41.0965 30.2712 40.2838C29.4584 39.471 29.052 38.494 29.052 37.3526C29.052 36.2113 29.4584 35.2343 30.2712 34.4215C31.084 33.6087 32.061 33.2023 33.2023 33.2023C34.3437 33.2023 35.3207 33.6087 36.1335 34.4215C36.9463 35.2343 37.3526 36.2113 37.3526 37.3526C37.3526 38.494 36.9463 39.471 36.1335 40.2838C35.3207 41.0965 34.3437 41.5029 33.2023 41.5029ZM10.687 8.30059L15.6674 18.6763H30.1934L35.9 8.30059H10.687ZM8.71561 4.15029H39.324C40.1195 4.15029 40.7248 4.5048 41.1398 5.21381C41.5548 5.92281 41.5721 6.64047 41.1917 7.36677L33.8249 20.6477C33.4444 21.3394 32.9343 21.8755 32.2945 22.2559C31.6546 22.6364 30.9543 22.8266 30.1934 22.8266H14.7335L12.4509 26.9769H37.3526V31.1272H12.4509C10.8945 31.1272 9.7186 30.4441 8.92313 29.078C8.12766 27.7119 8.09307 26.3544 8.81937 25.0055L11.6208 19.9214L4.15029 4.15029H0V0H6.74423L8.71561 4.15029Z" /></svg>
                {addLabel ?? 'Add to Cart'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
