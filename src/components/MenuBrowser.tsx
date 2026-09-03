'use client';

import { useMemo, useState } from 'react';
import type { MenuCategory } from '@/lib/menu-data';
import CategoryNav from './CategoryNav';

interface Props {
  categories: MenuCategory[];
}

export default function MenuBrowser({ categories }: Props) {
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtering = q.length > 0 || catFilter !== null;

  /* filter products by search text + category chip */
  const visible = useMemo(() => {
    return categories
      .filter((c) => catFilter === null || c.slug === catFilter)
      .map((c) => ({
        ...c,
        products: q
          ? c.products.filter((p) => p.name.toLowerCase().includes(q))
          : c.products,
      }))
      .filter((c) => c.products.length > 0);
  }, [categories, q, catFilter]);

  const resultCount = visible.reduce((sum, c) => sum + c.products.length, 0);

  return (
    <>
      {/* search + category filter row */}
      <div className="menu-search-row">
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
        <div className="menu-filter-chips" role="group" aria-label="Filter by category">
          <button
            className={`cat-chip${catFilter === null ? ' is-active' : ''}`}
            onClick={() => setCatFilter(null)}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              className={`cat-chip${catFilter === c.slug ? ' is-active' : ''}`}
              onClick={() => setCatFilter(catFilter === c.slug ? null : c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* jump navigation only while browsing the full menu */}
      {!filtering && (
        <CategoryNav categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      )}

      {filtering && (
        <p className="menu-result-count" role="status">
          {resultCount === 0
            ? 'No items match your search.'
            : `${resultCount} item${resultCount === 1 ? '' : 's'} found`}
        </p>
      )}

      {resultCount === 0 && filtering ? (
        <div className="menu-empty">
          <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true">
            <path fill="none" stroke="#e09344" strokeWidth="1.6" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" />
          </svg>
          <h3>Nothing found</h3>
          <p>Try a different word, or clear the search to browse the full menu.</p>
          <button className="btn btn-solid" onClick={() => { setQuery(''); setCatFilter(null); }}>
            Show Full Menu
          </button>
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
                <article key={p.slug} className="product-card">
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
    </>
  );
}
