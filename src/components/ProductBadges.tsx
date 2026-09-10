'use client';

/* Floating merchandising badges (Hot Deal / Sale / New / Bestseller) shown on
   product cards, the PDP, and the quick-view modal. Driven by product.tags
   (see menu-data MERCH). Shows at most two, highest-priority first. */

import type { ProductTag } from '@/lib/menu-data';

const META: Record<ProductTag, string> = {
  hot: 'Hot Deal',
  sale: 'Sale',
  new: 'New',
  bestseller: 'Bestseller',
};

/* display priority when an item has several tags */
const ORDER: ProductTag[] = ['hot', 'sale', 'new', 'bestseller'];

interface Props {
  tags?: ProductTag[];
  className?: string;
  variant?: 'pills' | 'ribbon';   // pills = image overlay (PDP/modal); ribbon = card corner
}

export default function ProductBadges({ tags, className = '', variant = 'pills' }: Props) {
  if (!tags || tags.length === 0) return null;
  const sorted = [...tags].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));

  if (variant === 'ribbon') {
    const t = sorted[0];   // one diagonal corner ribbon = the top-priority tag
    return (
      <span className={`pribbon pribbon-${t} ${className}`.trim()} aria-hidden="true">
        <span>{META[t]}</span>
      </span>
    );
  }

  return (
    <span className={`pbadges ${className}`.trim()} aria-hidden="true">
      {sorted.slice(0, 2).map((t) => (
        <span key={t} className={`pbadge pbadge-${t}`}>{META[t]}</span>
      ))}
    </span>
  );
}
