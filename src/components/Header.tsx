'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useUI } from './ui-context';
import { useCart } from './cart-context';

export default function Header() {
  const { openDrawer } = useUI();
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const submitSearch = () => {
    const q = searchValue.trim();
    setSearchOpen(false);
    setSearchValue('');
    router.push(q ? `/menu?q=${encodeURIComponent(q)}` : '/menu');
  };

  /* /catering is a standalone landing with its own chrome (reference behavior) */
  if (pathname === '/catering') return null;

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-left">
          <button className="icon-btn hamburger" aria-label="Menu" onClick={openDrawer}>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
            </svg>
          </button>
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/menu">Menu</Link>
            <Link href="/branches">Branches</Link>
            <Link href="/offers">Offers</Link>
            <Link href="/catering">Catering</Link>
          </nav>
        </div>

        <div className="header-center">
          <Link href="/" className="logo" aria-label="Bondok Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-img" src="/bondok/logo.webp" alt="Bondok Fried Chicken" />
          </Link>
        </div>

        <div className="header-right">
          <div className={`header-search${searchOpen ? ' is-open' : ''}`}>
            <input
              ref={searchRef}
              type="search"
              placeholder="Search the menu..."
              aria-label="Search the menu"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch();
                if (e.key === 'Escape') { setSearchOpen(false); setSearchValue(''); }
              }}
            />
            <button
              className="icon-btn header-search-btn"
              aria-label={searchOpen ? 'Submit search' : 'Search the menu'}
              onClick={() => {
                if (searchOpen) submitSearch();
                else { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 60); }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/Icon-search.svg" alt="" width="20" height="20" />
            </button>
          </div>
          <Link href="/rewards" className="rewards-link" aria-label="Bondok Rewards">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bondok/rewards.webp" alt="Rewards" className="rewards-img" />
          </Link>
          <button className="btn btn-outline btn-signup">Sign Up</button>
          <Link href="/bag" className="btn btn-solid btn-bag" aria-label="View shopping bag">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M7 7V6a5 5 0 0 1 10 0v1h3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7h3zm2 0h6V6a3 3 0 0 0-6 0v1z" />
            </svg>
            <span>Bag</span>
            {count > 0 && <span className="bag-count">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
