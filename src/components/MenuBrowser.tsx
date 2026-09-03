'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { MenuCategory, Product, Protein, Size } from '@/lib/menu-data';

interface Props {
  categories: MenuCategory[];
}

const SIZES: { value: Size; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
];

const PROTEINS: { value: Protein; label: string }[] = [
  { value: 'chicken', label: 'Chicken' },
  { value: 'beef', label: 'Beef' },
  { value: 'shrimp', label: 'Shrimp' },
  { value: 'turkey', label: 'Turkey' },
];

interface Filters {
  sizes: Set<Size>;
  proteins: Set<Protein>;
  spicy: boolean;
  cheesy: boolean;
  priceMax: number | null;
}

const emptyFilters = (): Filters => ({
  sizes: new Set(),
  proteins: new Set(),
  spicy: false,
  cheesy: false,
  priceMax: null,
});

function matches(p: Product, f: Filters, q: string): boolean {
  if (q && !p.name.toLowerCase().includes(q)) return false;
  if (f.sizes.size > 0 && (!p.size || !f.sizes.has(p.size))) return false;
  if (f.proteins.size > 0 && (!p.protein || !f.proteins.has(p.protein))) return false;
  if (f.spicy && !p.spicy) return false;
  if (f.cheesy && !p.cheesy) return false;
  if (f.priceMax !== null && (p.price === undefined || p.price > f.priceMax)) return false;
  return true;
}

export default function MenuBrowser({ categories }: Props) {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* FLIP reordering via the View Transitions API (native FLIP); no-op fallback */
  const withFlip = (fn: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) doc.startViewTransition(() => flushSync(fn));
    else fn();
  };

  /* desktop mouse drag-to-scroll for the category bar */
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    let down = false, startX = 0, startScroll = 0, moved = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;         // touch keeps native scrolling
      down = true; moved = 0; startX = e.clientX; startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => { down = false; };
    const onClick = (e: MouseEvent) => {
      if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; }  // drag, not click
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('click', onClick, true);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('click', onClick, true);
    };
  }, []);

  const q = query.trim().toLowerCase();

  /* price filter appears only once real prices exist in the data */
  const priceCeiling = useMemo(() => {
    const prices = categories.flatMap((c) => c.products).map((p) => p.price).filter((v): v is number => v !== undefined);
    return prices.length > 0 ? Math.max(...prices) : null;
  }, [categories]);

  const activeCount =
    filters.sizes.size + filters.proteins.size +
    (filters.spicy ? 1 : 0) + (filters.cheesy ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0);

  const filtering = q.length > 0 || catFilter !== null || activeCount > 0;

  const visible = useMemo(() => {
    return categories
      .filter((c) => catFilter === null || c.slug === catFilter)
      .map((c) => ({ ...c, products: c.products.filter((p) => matches(p, filters, q)) }))
      .filter((c) => c.products.length > 0);
  }, [categories, catFilter, filters, q]);

  const resultCount = visible.reduce((sum, c) => sum + c.products.length, 0);

  const toggleSize = (v: Size) =>
    withFlip(() => setFilters((f) => {
      const s = new Set(f.sizes); if (s.has(v)) s.delete(v); else s.add(v);
      return { ...f, sizes: s };
    }));
  const toggleProtein = (v: Protein) =>
    withFlip(() => setFilters((f) => {
      const s = new Set(f.proteins); if (s.has(v)) s.delete(v); else s.add(v);
      return { ...f, proteins: s };
    }));
  const clearAll = () => withFlip(() => { setFilters(emptyFilters()); setCatFilter(null); setQuery(''); });

  /* Esc closes the mobile drawer; lock scroll while open */
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDrawerOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const filterGroups = (
    <>
      <div className="fgroup">
        <h4>Size</h4>
        <div className="fchips">
          {SIZES.map((s) => (
            <button key={s.value} className={`fchip${filters.sizes.has(s.value) ? ' is-on' : ''}`} onClick={() => toggleSize(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fgroup">
        <h4>Protein</h4>
        <div className="fchips">
          {PROTEINS.map((p) => (
            <button key={p.value} className={`fchip${filters.proteins.has(p.value) ? ' is-on' : ''}`} onClick={() => toggleProtein(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fgroup">
        <h4>Taste</h4>
        <div className="fchips">
          <button className={`fchip${filters.spicy ? ' is-on' : ''}`} onClick={() => withFlip(() => setFilters((f) => ({ ...f, spicy: !f.spicy })))}>
            Spicy 🌶
          </button>
          <button className={`fchip${filters.cheesy ? ' is-on' : ''}`} onClick={() => withFlip(() => setFilters((f) => ({ ...f, cheesy: !f.cheesy })))}>
            Cheesy
          </button>
        </div>
      </div>
      {priceCeiling !== null && (
        <div className="fgroup">
          <h4>Max price: {filters.priceMax ?? priceCeiling} EGP</h4>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            value={filters.priceMax ?? priceCeiling}
            onChange={(e) => setFilters((f) => ({ ...f, priceMax: Number(e.target.value) }))}
          />
        </div>
      )}
      {activeCount > 0 && (
        <button className="fclear" onClick={() => withFlip(() => setFilters(emptyFilters()))}>Clear filters ({activeCount})</button>
      )}
    </>
  );

  return (
    <>
      {/* search + mobile filters button */}
      <div className="menu-toolbar">
        <div className="menu-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
          </svg>
          <input
            type="search"
            placeholder="Search the menu..."
            aria-label="Search the menu"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="menu-search-clear" aria-label="Clear search" onClick={() => setQuery('')}>
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 5.7 18.3l-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l4.9-4.9z" /></svg>
            </button>
          )}
        </div>
        <button className="filters-btn" onClick={() => setDrawerOpen(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2l-7 7v5l-4 2v-7L3 7z" /></svg>
          Filters
          {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
        </button>
      </div>

      {/* sticky category chips: click = show only that category */}
      <nav className="cat-nav" aria-label="Filter by category">
        <div className="cat-nav-inner" ref={navRef}>
          <button className={`cat-chip${catFilter === null ? ' is-active' : ''}`} onClick={() => withFlip(() => setCatFilter(null))}>All</button>
          {categories.map((c) => (
            <button
              key={c.slug}
              className={`cat-chip${catFilter === c.slug ? ' is-active' : ''}`}
              onClick={() => withFlip(() => setCatFilter(catFilter === c.slug ? null : c.slug))}
            >
              {c.name}
            </button>
          ))}
        </div>
      </nav>

      <div className="menu-layout">
        {/* desktop filter sidebar */}
        <aside className="filter-sidebar" aria-label="Product filters">
          <h3>Filters</h3>
          {filterGroups}
        </aside>

        <div className="menu-content">
          {filtering && (
            <p className="menu-result-count" role="status">
              {resultCount === 0 ? 'No items match your search.' : `${resultCount} item${resultCount === 1 ? '' : 's'} found`}
            </p>
          )}

          {resultCount === 0 && filtering ? (
            <div className="menu-empty">
              <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true">
                <path fill="none" stroke="#e09344" strokeWidth="1.6" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
              </svg>
              <h3>Nothing found</h3>
              <p>Try different filters, or clear everything to browse the full menu.</p>
              <button className="btn btn-solid" onClick={clearAll}>Show Full Menu</button>
            </div>
          ) : (
            visible.map((cat) => (
              <section key={cat.slug} id={cat.slug} className="menu-section">
                <div className="menu-section-head">
                  <h2>{cat.name}</h2>
                  <p>{cat.blurb}</p>
                </div>
                <div className="menu-grid">
                  {cat.products.map((p) => (
                    <article key={p.slug} className="product-card" style={{ viewTransitionName: `p-${cat.slug}-${p.slug}` }}>
                      <div className="product-imgwrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image} alt={p.name} loading="lazy" />
                      </div>
                      <div className="product-body">
                        <h3>{p.name}</h3>
                        {p.price !== undefined && <span className="product-price">EGP {p.price}</span>}
                        <button className="btn btn-outline product-add">Add to Bag</button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      {/* mobile filters bottom sheet */}
      {drawerOpen && (
        <div className="fdrawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
          <div className="fdrawer" role="dialog" aria-label="Filters">
            <span className="omodal-grabber" />
            <div className="fdrawer-head">
              <h3>Filters</h3>
              <button className="icon-btn" aria-label="Close filters" onClick={() => setDrawerOpen(false)}>
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 5.7 18.3l-1.4-1.4L10.6 12 4.3 5.7l1.4-1.4L12 10.6l4.9-4.9z" /></svg>
              </button>
            </div>
            <div className="fdrawer-body">{filterGroups}</div>
            <div className="fdrawer-actions">
              <button className="btn btn-outline" onClick={() => withFlip(() => setFilters(emptyFilters()))}>Clear</button>
              <button className="btn btn-solid" onClick={() => setDrawerOpen(false)}>
                Show {resultCount} item{resultCount === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
