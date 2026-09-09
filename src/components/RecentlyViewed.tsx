'use client';

/* Horizontal strip of recently viewed products.
   Shown on the menu launcher and the bag page; hides itself when empty.
   Mouse users can drag-to-scroll the row; touch uses native scrolling. */

import Link from 'next/link';
import { useRef } from 'react';
import { usePrefs } from './prefs-context';
import { menuCategories } from '@/lib/menu-data';
import type { MenuCategory, Product } from '@/lib/menu-data';

/* slug -> { category, product } lookup, built once */
const lookup = new Map<string, { cat: MenuCategory; p: Product }>();
for (const cat of menuCategories) {
  for (const p of cat.products) lookup.set(p.slug, { cat, p });
}

export default function RecentlyViewed({ title = 'Recently viewed' }: { title?: string }) {
  const { recent } = usePrefs();
  const items = recent
    .map((slug) => lookup.get(slug))
    .filter((x): x is { cat: MenuCategory; p: Product } => Boolean(x));

  const rowRef = useRef<HTMLDivElement>(null);
  /* drag-to-scroll state; `moved` lets us cancel the click after a drag */
  const drag = useRef({ down: false, moved: false, startX: 0, scroll: 0 });

  if (items.length === 0) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return; // touch keeps native scroll
    const row = rowRef.current;
    if (!row) return;
    drag.current = { down: true, moved: false, startX: e.clientX, scroll: row.scrollLeft };
    row.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const row = rowRef.current;
    if (!row || !drag.current.down) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    row.scrollLeft = drag.current.scroll - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    drag.current.down = false;
    const row = rowRef.current;
    if (row?.hasPointerCapture(e.pointerId)) row.releasePointerCapture(e.pointerId);
  };
  /* if the pointer moved, swallow the click so a drag doesn't open a product */
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); }
  };

  return (
    <section className="recent-strip" aria-label={title}>
      <h2>{title}</h2>
      <div
        className="recent-row"
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
      >
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
