'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from './cart-context';
import { useUI } from './ui-context';
import { usePricedCategories } from './catalog-context';
import ProductBadges from './ProductBadges';
import LocationBar from './LocationBar';
import { EVENTS, publish } from '@/lib/pubsub';
import type { MenuCategory, Product, Protein, Size } from '@/lib/menu-data';
import CloseIcon from './CloseIcon';
import ProductModal from './ProductModal';
import FavButton from './FavButton';
import RecentlyViewed from './RecentlyViewed';
import { useDragScroll } from './useDragScroll';
import { usePrefs } from './prefs-context';
import Select from './Select';

interface Props {
  categories: MenuCategory[];
  initialCategory?: string;   // set when rendered at /menu/[category]
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

/* per-category emoji glyphs for the sidebar (reference uses food emojis) */
const CAT_EMOJI: Record<string, string> = {
  sandwiches: '🍔', fillet: '🍗', grilled: '🥪', burgers: '🍔',
  rolls: '🌯', meals: '🍗', 'kids-tenders': '🍟', sides: '🥔',
};

type Spice = 'mild' | 'medium' | 'hot' | 'extra-hot';
const SPICE_LEVELS: { value: Spice; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'medium', label: 'Medium' },
  { value: 'hot', label: 'Hot' },
  { value: 'extra-hot', label: 'Extra Hot' },
];
/* non-mild picks mean "wants heat" -> match spicy products */
const HEAT: Spice[] = ['medium', 'hot', 'extra-hot'];

/* quick-search chips (reference "Popular:" row) - each seeds the search box */
const POPULAR_TAGS = ['Chicken Fire', 'Cheddar Fries', 'Brioche Burgers', 'Mozzarella Crunch', 'Cold Brew', 'Family Box'];

/* in-category quick tabs (reference header pills) */
const SUB_TABS = ['All Items', 'Popular', 'Best Sellers', 'New In', 'Spicy', 'Combos & Value Meals'] as const;
type SubTab = typeof SUB_TABS[number];

const CAT_EYEBROW = 'Fresh on-demand prep • 100% signature ingredients';

interface Filters {
  sizes: Set<Size>;
  proteins: Set<Protein>;
  spice: Set<Spice>;
  priceMin: number | null;
  priceMax: number | null;
}

const emptyFilters = (): Filters => ({
  sizes: new Set(), proteins: new Set(), spice: new Set(), priceMin: null, priceMax: null,
});

function matches(p: Product, f: Filters, q: string): boolean {
  if (q && !p.name.toLowerCase().includes(q)) return false;
  if (f.sizes.size > 0 && (!p.size || !f.sizes.has(p.size))) return false;
  if (f.proteins.size > 0 && (!p.protein || !f.proteins.has(p.protein))) return false;
  if (f.spice.size > 0) {
    const wantsHeat = HEAT.some((s) => f.spice.has(s));
    const wantsMild = f.spice.has('mild');
    if (!((wantsHeat && p.spicy) || (wantsMild && !p.spicy))) return false;
  }
  if (f.priceMin !== null && (p.price === undefined || p.price < f.priceMin)) return false;
  if (f.priceMax !== null && (p.price === undefined || p.price > f.priceMax)) return false;
  return true;
}

/* sub-tab -> which products qualify (tags/flags from menu-data merchandising) */
function matchesSubTab(p: Product, t: SubTab): boolean {
  switch (t) {
    case 'Popular':
    case 'Best Sellers': return p.tags?.includes('bestseller') ?? false;
    case 'New In': return p.tags?.includes('new') ?? false;
    case 'Spicy': return p.spicy === true;
    case 'Combos & Value Meals': return (p.margin ?? 0) >= 5;
    default: return true;   // All Items
  }
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

export default function MenuBrowser({ categories: baseCategories, initialCategory }: Props) {
  /* overlay the active branch's prices onto the (price-less) menu structure */
  const categories = usePricedCategories(baseCategories);
  const { add } = useCart();
  const { openOrder } = useUI();
  const { favorites, recordView } = usePrefs();
  const subtabsDrag = useDragScroll<HTMLDivElement>();
  const popularDrag = useDragScroll<HTMLDivElement>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<'launcher' | 'browse'>(() =>
    initialCategory || searchParams.get('q') || searchParams.get('cat') || searchParams.get('item') ? 'browse' : 'launcher',
  );
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sheetOpen, setSheetOpen] = useState(false);          // mobile filters sheet
  const [sort, setSort] = useState<'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('default');
  const [activeCat, setActiveCat] = useState<string>(() => initialCategory ?? searchParams.get('cat') ?? categories[0]?.slug ?? '');
  const [subTab, setSubTab] = useState<SubTab>('All Items');
  const [hotOnly, setHotOnly] = useState(false);   // "Today's Hot Deals" toggle
  const [selected, setSelected] = useState<{ cat: string; slug: string } | null>(null);
  const [favOnly, setFavOnly] = useState(() => searchParams.get('fav') === '1');

  /* ---------- deep links: ?q= ?cat= ?item= ---------- */
  useEffect(() => {
    const qp = searchParams.get('q');
    if (qp !== null) { setQuery(qp); if (qp) setView('browse'); }
    const item = searchParams.get('item');
    if (item) {
      for (const c of categories) {
        if (c.products.some((p) => p.slug === item)) {
          setView('browse');
          setActiveCat(c.slug);
          setSelected({ cat: c.slug, slug: item });
          break;
        }
      }
    }
    if (searchParams.get('fav') === '1') { setFavOnly(true); setView('browse'); }
    const cat = searchParams.get('cat');
    if (cat && categories.some((c) => c.slug === cat)) {
      setView('browse');
      setActiveCat(cat);
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
    filters.sizes.size + filters.proteins.size + filters.spice.size +
    (filters.priceMin !== null || filters.priceMax !== null ? 1 : 0);

  const filtering = q.length > 0 || activeCount > 0 || favOnly;
  const searching = q.length > 0;

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === activeCat) ?? categories[0],
    [categories, activeCat],
  );

  /* one focused collection at a time: search results (global), favorites, or
     the selected category - matching the reference single-header layout */
  const shown = useMemo(() => {
    const sorters: Record<string, (a: Product, b: Product) => number> = {
      'name-asc': (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'price-asc': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      'price-desc': (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity),
    };
    let base: Product[];
    let title: string;
    let eyebrow = CAT_EYEBROW;
    let blurb: string | undefined;
    let catMode = false;
    if (searching) {
      base = categories.flatMap((c) => c.products);
      title = `Results for “${query.trim()}”`;
      blurb = 'Matches across the full Bondok menu.';
    } else if (favOnly) {
      base = categories.flatMap((c) => c.products).filter((p) => favorites.includes(p.slug));
      title = 'My Favorites';
      eyebrow = 'Saved by you';
      blurb = 'Everything you tapped the heart on - ready to reorder.';
    } else {
      base = activeCategory?.products ?? [];
      title = activeCategory?.name ?? '';
      blurb = activeCategory?.blurb;
      catMode = true;
    }
    const total = base.length;
    let products = base.filter(
      (p) => matches(p, filters, q)
        && (catMode ? matchesSubTab(p, subTab) : true)
        && (!hotOnly || (p.tags?.includes('hot') ?? false)),
    );
    if (sort !== 'default') products = [...products].sort(sorters[sort]);
    else if (catMode) products = [...products].sort((a, b) => (b.margin ?? 0) - (a.margin ?? 0));  // Featured = high-margin first (golden triangle)
    return { products, title, eyebrow, blurb, total, catMode };
  }, [categories, activeCategory, filters, q, query, sort, favOnly, favorites, searching, subTab, hotOnly]);

  const resultCount = shown.products.length;

  /* FLIP cost is per named element - cap tracking to the first 20 cards so
     large toggles (favorites, clear) stay instant; the rest crossfade */
  const flipBudget = useMemo(
    () => new Set(shown.products.slice(0, 20).map((p) => p.slug)),
    [shown],
  );

  useEffect(() => {
    if (q) publish(EVENTS.search, { source: 'menu-page', query: q, results: resultCount });
  }, [q, resultCount]);
  useEffect(() => {
    publish(EVENTS.filterChange, { source: 'menu-page', active: activeCount });
  }, [activeCount]);

  /* keep ?fav=1 in the URL synced with the toggle, so the drawer link
     always works even after toggling off (same-URL clicks were no-ops) */
  const setFavOnlySynced = useCallback((v: boolean) => {
    setFavOnly(v);
    const url = new URL(window.location.href);
    if (v) url.searchParams.set('fav', '1');
    else url.searchParams.delete('fav');
    window.history.replaceState(null, '', url.toString());
  }, []);

  /* categories are real routes now: /menu (catalog) and /menu/[category].
     Navigating remounts the browser with the right initialCategory, so the
     browser back button lands correctly (/menu/xxx -> /menu). */
  const selectCategory = useCallback((slug: string) => {
    router.push(`/menu/${slug}`);
  }, [router]);

  const openCategory = (slug: string) => {
    router.push(`/menu/${slug}`);
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
  const toggleSpice = (v: Spice) =>
    withFlip(() => setFilters((f) => {
      const s = new Set(f.spice); if (s.has(v)) s.delete(v); else s.add(v);
      return { ...f, spice: s };
    }));
  const clearAll = () => withFlip(() => { setFilters(emptyFilters()); setQuery(''); setFavOnlySynced(false); });

  /* removable "applied" chips (reference sidebar summary) */
  const appliedChips = useMemo(() => {
    const chips: { label: string; remove: () => void }[] = [];
    filters.proteins.forEach((p) =>
      chips.push({ label: PROTEINS.find((x) => x.value === p)!.label, remove: () => toggleProtein(p) }));
    filters.spice.forEach((s) =>
      chips.push({ label: `${SPICE_LEVELS.find((x) => x.value === s)!.label} Spice`, remove: () => toggleSpice(s) }));
    filters.sizes.forEach((s) =>
      chips.push({ label: `${SIZES.find((x) => x.value === s)!.label} Build`, remove: () => toggleSize(s) }));
    if (filters.priceMin !== null || filters.priceMax !== null)
      chips.push({ label: `EGP ${filters.priceMin ?? 0}–${filters.priceMax ?? priceCeiling ?? 0}`, remove: () => withFlip(() => setFilters((f) => ({ ...f, priceMin: null, priceMax: null }))) });
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, priceCeiling]);

  /* Esc closes the mobile filters sheet; lock scroll while open */
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSheetOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [sheetOpen]);

  /* slug -> category slug (shown products are a flat list now) */
  const productCat = useMemo(() => {
    const m = new Map<string, string>();
    categories.forEach((c) => c.products.forEach((p) => m.set(p.slug, c.slug)));
    return m;
  }, [categories]);

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
      <div className="fgroup fgroup-switch">
        <button
          type="button"
          role="switch"
          aria-checked={hotOnly}
          className={`fswitch${hotOnly ? ' is-on' : ''}`}
          onClick={() => setHotOnly((v) => !v)}
        >
          <span className="fswitch-label">🔥 Today&apos;s Hot Deals</span>
          <span className="fswitch-track" aria-hidden="true"><span className="fswitch-knob" /></span>
        </button>
      </div>
      <div className="fgroup">
        <h4>Size / Build</h4>
        <div className="fchips fchips-seg">
          {SIZES.map((s) => (
            <button key={s.value} className={`fchip${filters.sizes.has(s.value) ? ' is-on' : ''}`} onClick={() => toggleSize(s.value)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="fgroup">
        <h4>Protein Selection</h4>
        <div className="fchips">
          {PROTEINS.map((p) => {
            const on = filters.proteins.has(p.value);
            return (
              <button key={p.value} className={`fchip${on ? ' is-on is-soft' : ''}`} onClick={() => toggleProtein(p.value)}>
                {on && <span className="fchip-check" aria-hidden="true">✓</span>}{p.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="fgroup">
        <h4>Spice Level</h4>
        <div className="fchips fchips-grid">
          {SPICE_LEVELS.map((s) => (
            <button
              key={s.value}
              className={`fchip${filters.spice.has(s.value) ? (s.value === 'extra-hot' ? ' is-on is-hot' : ' is-on') : ''}`}
              onClick={() => toggleSpice(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      {priceCeiling !== null && (
        <div className="fgroup">
          <div className="fgroup-head">
            <h4>Price Range</h4>
            <span className="fprice-cap">EGP 0 — EGP {priceCeiling}</span>
          </div>
          <div className="fprice-track">
            <span className="fprice-rail" aria-hidden="true" />
            <span
              className="fprice-fill"
              aria-hidden="true"
              style={{
                left: `${((filters.priceMin ?? 0) / priceCeiling) * 100}%`,
                right: `${100 - ((filters.priceMax ?? priceCeiling) / priceCeiling) * 100}%`,
              }}
            />
            <input
              type="range" min={0} max={priceCeiling} aria-label="Minimum price"
              value={filters.priceMin ?? 0}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), filters.priceMax ?? priceCeiling);
                setFilters((f) => ({ ...f, priceMin: v }));
              }}
            />
            <input
              type="range" min={0} max={priceCeiling} aria-label="Maximum price"
              value={filters.priceMax ?? priceCeiling}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), filters.priceMin ?? 0);
                setFilters((f) => ({ ...f, priceMax: v }));
              }}
            />
          </div>
          <div className="fprice-io">
            <span className="fprice-chip"><em>MIN</em> EGP {filters.priceMin ?? 0}</span>
            <span className="fprice-dash">—</span>
            <span className="fprice-chip"><em>MAX</em> EGP {filters.priceMax ?? priceCeiling}</span>
          </div>
        </div>
      )}
      {appliedChips.length > 0 && (
        <div className="fapplied">
          <div className="fgroup-head">
            <h4>Applied ({appliedChips.length})</h4>
            <button className="freset" onClick={() => withFlip(() => setFilters(emptyFilters()))}>Reset</button>
          </div>
          <div className="fapplied-chips">
            {appliedChips.map((c) => (
              <button key={c.label} className="fapplied-chip" onClick={c.remove}>
                {c.label} <span aria-hidden="true">✕</span>
              </button>
            ))}
          </div>
        </div>
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
      <LocationBar fullBleed />

      <AnimatePresence mode="wait" initial={false}>
      {view === 'launcher' ? (
        <motion.div
          key="launcher"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {/* launcher: one tile per category (top promo/featured strip removed) */}
          <div className="cat-tiles menu-cat-tiles">
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
          {/* sidebar: full-catalog list (emoji + counts) + filters */}
          <aside className="menu-side">
            <button className="menu-catalog-back" onClick={() => { setQuery(''); setView('launcher'); router.push('/menu'); window.scrollTo({ top: 0 }); }}>
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
              </svg>
              Full Menu Catalog
            </button>

            <p className="menu-side-label">Categories</p>
            <button
              className={`cat-row cat-fav${favOnly ? ' is-active' : ''}`}
              onClick={() => withFlip(() => setFavOnlySynced(!favOnly))}
            >
              <span className="cat-emoji" aria-hidden="true">❤️</span>
              <span className="cat-name">My Favorites</span>
              <span className="cat-count">{favorites.length}</span>
            </button>
            {categories.map((c) => {
              const on = !favOnly && !searching && activeCat === c.slug;
              return (
                <button key={c.slug} className={`cat-row${on ? ' is-active' : ''}`} onClick={() => selectCategory(c.slug)}>
                  <span className="cat-emoji" aria-hidden="true">{CAT_EMOJI[c.slug] ?? '🍽️'}</span>
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-count">{c.products.length}</span>
                </button>
              );
            })}

            <div className="side-filters">
              <div className="side-filters-head">
                <h3>
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M3 5h18v2l-7 7v5l-4 2v-7L3 7z" /></svg>
                  Filters
                </h3>
                {activeCount > 0 && <button className="side-clearall" onClick={clearAll}>Clear All</button>}
              </div>
              {filterGroups}
            </div>
          </aside>

          <div className="menu-content">
            {/* search card: search + sort + popular quick-picks */}
            <div className="menu-searchcard">
              {searchBar}
              <div className="menu-popular" ref={popularDrag.ref} {...popularDrag.dragProps}>
                <span className="menu-popular-label">Popular:</span>
                {POPULAR_TAGS.map((t) => (
                  <button key={t} className="menu-poptag" onClick={() => { setView('browse'); withFlip(() => setQuery(t)); }}>{t}</button>
                ))}
              </div>
            </div>

            {/* collection header card */}
            <div className="menu-headcard">
              <p className="menu-eyebrow"><span className="menu-eyebrow-dot" aria-hidden="true" />{shown.eyebrow}</p>
              <div className="menu-headrow">
                <h1 className="menu-headtitle">{shown.title}</h1>
                <span className="menu-headcount">
                  Showing {resultCount} of {shown.total} items{filtering ? ' • Filtered Active' : ''}
                </span>
              </div>
              {shown.blurb && <p className="menu-headdesc">{shown.blurb}</p>}
              {shown.catMode && (
                <div className="menu-subtabs" ref={subtabsDrag.ref} {...subtabsDrag.dragProps}>
                  {SUB_TABS.map((t) => (
                    <button key={t} className={`menu-subtab${subTab === t ? ' is-on' : ''}`} onClick={() => withFlip(() => setSubTab(t))}>{t}</button>
                  ))}
                </div>
              )}
            </div>

            {resultCount === 0 ? (
              <div className="menu-empty">
                <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true">
                  <path fill="none" stroke="#e09344" strokeWidth="1.6" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
                </svg>
                <h3>{favOnly && favorites.length === 0 ? 'No favorites yet' : 'Nothing found'}</h3>
                <p>{favOnly && favorites.length === 0 ? 'Tap the heart on any product to save it here.' : 'Try different filters, or clear everything to browse the full menu.'}</p>
                <button className="btn btn-solid" onClick={clearAll}>Show Full Menu</button>
              </div>
            ) : (
              <div className="pcard-grid">
                {shown.products.map((p) => {
                  const catSlug = productCat.get(p.slug) ?? activeCat;
                  return (
                    <article
                      key={p.slug}
                      className={`pcard${(p.margin ?? 0) >= 5 ? ' is-featured' : ''}`}
                      style={flipBudget.has(p.slug) ? { viewTransitionName: `p-${catSlug}-${p.slug}` } : undefined}
                      onClick={() => { recordView(p.slug); setSelected({ cat: catSlug, slug: p.slug }); }}
                    >
                      <ProductBadges tags={p.tags} variant="ribbon" className="pcard-ribbon" />
                      <FavButton slug={p.slug} className="pcard-fav" />
                      <div className="pcard-info">
                        <h3>{p.name}</h3>
                        <p>{p.description ?? shown.blurb}</p>
                        {p.price !== undefined && <span className="product-price">EGP {p.price}</span>}
                        <button
                          className="btn btn-solid pcard-add"
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
                  );
                })}
              </div>
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
