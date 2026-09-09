'use client';

/* Horizontal strip of recently viewed products.
   Shown on the menu launcher and the bag page; hides itself when empty.
   Mouse users can drag-to-scroll (with momentum); touch uses native scroll. */

import Link from 'next/link';
import { usePrefs } from './prefs-context';
import { useDragScroll } from './useDragScroll';
import { menuCategories } from '@/lib/menu-data';
import type { MenuCategory, Product } from '@/lib/menu-data';

/* slug -> { category, product } lookup, built once */
const lookup = new Map<string, { cat: MenuCategory; p: Product }>();
for (const cat of menuCategories) {
  for (const p of cat.products) lookup.set(p.slug, { cat, p });
}

export default function RecentlyViewed({ title = 'Recently viewed' }: { title?: string }) {
  const { recent } = usePrefs();
  const { ref, dragProps } = useDragScroll<HTMLDivElement>();
  const items = recent
    .map((slug) => lookup.get(slug))
    .filter((x): x is { cat: MenuCategory; p: Product } => Boolean(x));

  if (items.length === 0) return null;

  return (
    <section className="recent-strip" aria-label={title}>
      <h2>{title}</h2>
      <div className="recent-row" ref={ref} {...dragProps}>
        {items.map(({ cat, p }) => (
          <Link key={p.slug} href={`/menu/${cat.slug}/${p.slug}`} className="recent-card" draggable={false}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.name} loading="lazy" draggable={false} />
            <span>{p.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
