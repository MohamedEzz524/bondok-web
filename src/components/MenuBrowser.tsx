'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useSearchParams } from 'next/navigation';
import { useCart } from './cart-context';
import { useUI } from './ui-context';
import { EVENTS, publish } from '@/lib/pubsub';
import Link from 'next/link';
import type { MenuCategory, Product, Protein, Size } from '@/lib/menu-data';
import { heroSlides } from '@/lib/data';
import CloseIcon from './CloseIcon';
import ProductModal from './ProductModal';
import FavButton from './FavButton';
import RecentlyViewed from './RecentlyViewed';
import { usePrefs } from './prefs-context';
import Select from './Select';

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
  sizes: new Set(), proteins: new Set(), spicy: false, cheesy: false, priceMax: null,
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

/* size-variant siblings (single/double/triple) inside the same category */
function variantsOf(cat: MenuCategory, p: Product): Product[] | null {
  if (!p.size) return null;
  const base = p.slug.replace(/-(double|triple)$/, '');
  const sibs = cat.products.filter(
    (x) => x.slug === base || x.slug === `${base}-double` || x.slug === `${base}-triple`,
  );
  return sibs.length > 1 ? sibs : null;
}

export default function MenuBrowser({ categories }: Props) {
  const { add } = useCart();
  const { openOrder } = useUI();
  const { favorites, recordView } = usePrefs();
  const searchParams = useSearchParams();

  const [view, setView] = useState<'launcher' | 'browse'>(() =>
    searchParams.get('q') || searchParams.get('cat') || searchParams.get('item') ? 'browse' : 'launcher',
  );
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);          // mobile filters sheet
  const [sort, setSort] = useState<'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('default');
  const [activeSection, setActiveSection] = useState<string>(categories[0]?.slug ?? '');
  const [selected, setSelected] = useState<{ cat: string; slug: string } | null>(null);
  const [favOnly, setFavOnly] = useState(() => searchParams.get('fav') === '1');
  const promoRef = useRef<HTMLDivElement>(null);

  /* ---------- deep links: ?q= ?cat= ?item= ---------- */
  useEffect(() => {
    const qp = searchParams.get('q');
    if (qp !== null) { setQuery(qp); if (qp) setView('browse'); }
    const item = searchParams.get('item');
    if (item) {
      for (const c of categories) {
        if (c.products.some((p) => p.slug === item)) {
          setView('browse');
          setSelected({ cat: c.slug, slug: item });
          break;
        }
      }
    }
    if (searchParams.get('fav') === '1') { setFavOnly(true); setView('browse'); }
    const cat = searchParams.get('cat');
    if (cat && categories.some((c) => c.slug === cat)) {
      setView('browse');
      setTimeout(() => document.getElementById(`sec-${cat}`)?.scrollIntoView({ behavior: 'smooth' }), 120);
    }
  }, [searchParams, categories]);

  /* FLIP reordering via the View Transitions API (native FLIP); no-op fallback */
  const withFlip = (fn: () => void) => {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition) doc.startViewTransition(() => flushSync(fn));
    else fn();
  };

  const q = query.trim().toLowerCase();

  const priceCeiling = useMemo(() => {
    const prices = categories.flatMap((c) => c.products).map((p) => p.price).filter((v): v is number => v !== undefined);
    return prices.length > 0 ? Math.max(...prices) : null;
  }, [categories]);

  const activeCount =
    filters.sizes.size + filters.proteins.size +
    (filters.spicy ? 1 : 0) + (filters.cheesy ? 1 : 0) +
    (filters.priceMax !== null ? 1 : 0);

  const filtering = q.length > 0 || activeCount > 0 || favOnly;

  const visible = useMemo(() => {
    const sorters: Record<string, (a: Product, b: Product) => number> = {
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      'price-desc': (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
    };
    return categories
      .map((c) => {
        const products = c.products.filter((p) => matches(p, filters, q) && (!favOnly || favorites.includes(p.slug)));
        if (sort !== 'default') products.sort(sorters[sort]);
        return { ...c, products };
      })
      .filter((c) => c.products.length > 0);
  }, [categories, filters, q, sort, favOnly, favorites]);

  const resultCount = visible.reduce((sum, c) => sum + c.products.length, 0);

  useEffect(() => {
    if (q) publish(EVENTS.search, { source: 'menu-page', query: q, results: resultCount });
  }, [q, resultCount]);
  useEffect(() => {
    publish(EVENTS.filterChange, { source: 'menu-page', active: activeCount });
  }, [activeCount]);

  /* ---------- scrollspy: highlight the section in view (reference sidebar behavior) ---------- */
  useEffect(() => {
    if (view !== 'browse') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveSection(e.target.id.replace('sec-', ''));
        }
      },
      { rootMargin: '-140px 0px -55% 0px' },
    );
    visible.forEach((c) => {
      const el = document.getElementById(`sec-${c.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [view, visible]);

  const scrollToSection = useCallback((slug: string) => {
    document.getElementById(`sec-${slug}`)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const openCategory = (slug: string) => {
    setView('browse');
    setActiveSection(slug);
    setTimeout(() => scrollToSection(slug), 120);
  };

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
  const clearAll = () => withFlip(() => { setFilters(emptyFilters()); setQuery(''); setFavOnly(false); });

  /* Esc closes the mobile filters sheet; lock scroll while open */
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheetOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [sheetOpen]);

  /* selected product + its variants for the popup */
  const selectedData = useMemo(() => {
    if (!selected) return null;
    const cat = categories.find((c) => c.slug === selected.cat);
    const product = cat?.products.find((p) => p.slug === selected.slug);
    if (!cat || !product) return null;
    return { cat, product, variants: variantsOf(cat, product) };
  }, [selected, categories]);

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
            Spicy
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
            type="range" min={0} max={priceCeiling}
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

  const searchBar = (
    <div className="menu-toolbar">
      <div className="menu-search">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
        </svg>
        <input
          type="search" placeholder="Search the menu..." aria-label="Search the menu"
          value={query}
          onChange={(e) => { const v = e.target.value; if (v) setView('browse'); withFlip(() => setQuery(v)); }}
        />
        {query && (
          <button className="menu-search-clear" aria-label="Clear search" onClick={() => withFlip(() => setQuery(''))}>
            <CloseIcon size={16} />
          </button>
        )}
      </div>
      {view === 'browse' && (
        <Select
          ariaLabel="Sort products"
          value={sort}
          onChange={(v) => withFlip(() => setSort(v as typeof sort))}
          options={[
            { value: 'default', label: 'Sort: Featured' },
            { value: 'name-asc', label: 'Name A-Z' },
            { value: 'name-desc', label: 'Name Z-A' },
            ...(priceCeiling !== null
              ? [
                  { value: 'price-asc', label: 'Price: Low to High' },
                  { value: 'price-desc', label: 'Price: High to Low' },
                ]
              : []),
          ]}
        />
      )}
      {view === 'browse' && (
        <button className="filters-btn" onClick={() => setSheetOpen(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2l-7 7v5l-4 2v-7L3 7z" /></svg>
          Filters
          {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* full-bleed branch banner (reference pattern) */}
      <div className="branch-banner">
        <div className="branch-banner-inner">
          <button className="branch-banner-text" onClick={() => openOrder('pickup')}>
            <strong>
              <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
              Choose a Location
            </strong>
            <span>For availability and prices</span>
          </button>
          <button className="branch-banner-link" onClick={() => openOrder('pickup')}>See Branches</button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
      {view === 'launcher' ? (
        <motion.div
          key="launcher"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* promo cards row (reference launcher structure);
              becomes a carousel only when more than 3 promos exist */}
          <div className="promo-wrap">
            {heroSlides.length > 3 && (
              <button
                className="promo-arrow promo-arrow-prev"
                aria-label="Previous promotions"
                onClick={() => promoRef.current?.scrollBy({ left: -promoRef.current.clientWidth / 3, behavior: 'smooth' })}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
              </button>
            )}
            <div className={`promo-row${heroSlides.length > 3 ? ' is-carousel' : ''}`} ref={promoRef}>
              {heroSlides.map((s) => (
                <Link key={s.title} href={s.href} className="promo-mini">
                  <div className="promo-mini-text">
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.image} alt={s.alt} loading="lazy" />
                </Link>
              ))}
            </div>
            {heroSlides.length > 3 && (
              <button
                className="promo-arrow promo-arrow-next"
                aria-label="More promotions"
                onClick={() => promoRef.current?.scrollBy({ left: promoRef.current.clientWidth / 3, behavior: 'smooth' })}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z" /></svg>
              </button>
            )}
          </div>
          {/* launcher: one tile per category (reference /menu structure) */}
          <div className="cat-tiles">
            {categories.map((c) => (
              <button key={c.slug} className="cat-tile" onClick={() => openCategory(c.slug)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.cover} alt={c.name} loading="lazy" />
                <div className="cat-tile-body">
                  <h3>{c.name}</h3>
                </div>
              </button>
            ))}
          </div>
          <RecentlyViewed />
        </motion.div>
      ) : (
        <motion.div
          key="browse"
          className="menu-layout"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* sidebar: category scrollspy list (reference) + our filters */}
          <aside className="menu-side">
            <button className="side-row side-row-top" onClick={() => { setView('launcher'); window.scrollTo({ top: 0 }); }}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
              </svg>
              <span className="side-label">Full Menu</span>
            </button>
            <button
              className={`side-row side-fav${favOnly ? ' is-active' : ''}`}
              onClick={() => withFlip(() => setFavOnly(!favOnly))}
            >
              <span className="side-thumb side-fav-ic">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path d="M12 21s-7.1-4.4-9.5-8.2C.7 9.9 1.6 6.4 4.7 5.3c2-.7 4 .1 5.8 2 .5.6 1 .6 1.5 0 1.8-1.9 3.8-2.7 5.8-2 3.1 1.1 4 4.6 2.2 7.5C17.1 16.6 12 21 12 21z" fill="currentColor" />
                </svg>
              </span>
              <span className="side-label">My Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                className={`side-row${activeSection === c.slug ? ' is-active' : ''}`}
                onClick={() => scrollToSection(c.slug)}
              >
                <span className="side-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.cover} alt="" loading="lazy" />
                </span>
                <span className="side-label">{c.name}</span>
              </button>
            ))}
            <div className="side-filters">
              <h3>Filters</h3>
              {filterGroups}
            </div>
          </aside>

          <div className="menu-content">
            {searchBar}
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
                <h3>{favOnly && favorites.length === 0 ? 'No favorites yet' : 'Nothing found'}</h3>
                <p>{favOnly && favorites.length === 0 ? 'Tap the heart on any product to save it here.' : 'Try different filters, or clear everything to browse the full menu.'}</p>
                <button className="btn btn-solid" onClick={clearAll}>Show Full Menu</button>
              </div>
            ) : (
              visible.map((cat) => (
                <section key={cat.slug} id={`sec-${cat.slug}`} className="menu-section">
                  <h2 className="menu-section-title">{cat.name}</h2>
                  <div className="pcard-grid">
                    {cat.products.map((p) => (
                      <article
                        key={p.slug}
                        className="pcard"
                        style={{ viewTransitionName: `p-${cat.slug}-${p.slug}` }}
                        onClick={() => { recordView(p.slug); setSelected({ cat: cat.slug, slug: p.slug }); }}
                      >
                        <FavButton slug={p.slug} className="pcard-fav" />
                        <div className="pcard-info">
                          <h3>{p.name}</h3>
                          <p>{p.description ?? cat.blurb}</p>
                          {p.price !== undefined && <span className="product-price">EGP {p.price}</span>}
                          <button
                            className="btn btn-outline pcard-add"
                            onClick={(e) => {
                              e.stopPropagation();
                              add({ slug: p.slug, name: p.name, image: p.image, price: p.price }, 'menu-page');
                            }}
                          >
                            Add to Bag
                          </button>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="pcard-img" src={p.image} alt={p.name} loading="lazy" />
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* mobile filters bottom sheet */}
      {sheetOpen && (
        <div className="fdrawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSheetOpen(false); }}>
          <div className="fdrawer" role="dialog" aria-label="Filters">
            <span className="omodal-grabber" />
            <div className="fdrawer-head">
              <h3>Filters</h3>
              <button className="icon-btn" aria-label="Close filters" onClick={() => setSheetOpen(false)}>
                <CloseIcon size={22} />
              </button>
            </div>
            <div className="fdrawer-body">{filterGroups}</div>
            <div className="fdrawer-actions">
              <button className="btn btn-outline" onClick={() => withFlip(() => setFilters(emptyFilters()))}>Clear</button>
              <button className="btn btn-solid" onClick={() => setSheetOpen(false)}>
                Show {resultCount} item{resultCount === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* product detail popup (reference pattern + our variants/qty/cart) */}
      {selectedData && (
        <ProductModal
          product={selectedData.product}
          variants={selectedData.variants}
          onSelectVariant={(p) => setSelected({ cat: selectedData.cat.slug, slug: p.slug })}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
