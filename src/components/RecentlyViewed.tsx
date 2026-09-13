'use client';

/* Horizontal strip of recently viewed products (menu launcher + bag page).
   Uses the shared ProductCard so it matches product cards elsewhere. */

import { usePrefs } from './prefs-context';
import { useCatalog } from './catalog-context';
import { useCarousel, CarouselArrows } from './Carousel';
import ProductCard from './ProductCard';
import { menuCategories } from '@/lib/menu-data';
import type { MenuCategory, Product } from '@/lib/menu-data';

/* slug -> { category, product } lookup, built once */
const lookup = new Map<string, { cat: MenuCategory; p: Product }>();
for (const cat of menuCategories) {
  for (const p of cat.products) lookup.set(p.slug, { cat, p });
}

export default function RecentlyViewed({ title = 'Recently viewed' }: { title?: string }) {
  const { recent } = usePrefs();
  const { priceOf } = useCatalog();
  const cr = useCarousel<HTMLDivElement>();
  const items = recent
    .map((slug) => lookup.get(slug))
    .filter((x): x is { cat: MenuCategory; p: Product } => Boolean(x));

  if (items.length === 0) return null;

  return (
    <section className="recent-strip" aria-label={title}>
      <h2>{title}</h2>
      <div className="recent-wrap crsl-wrap">
        <CarouselArrows nav={cr.nav} onNav={cr.scrollByPage} />
        <div className="recent-row" ref={cr.ref} {...cr.dragProps}>
          {items.map(({ cat, p }) => (
            <ProductCard
              key={p.slug}
              product={{ ...p, price: priceOf(p.slug) }}
              href={`/menu/${cat.slug}/${p.slug}`}
              variant="vertical"
              size="sm"
              source="recently-viewed"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
