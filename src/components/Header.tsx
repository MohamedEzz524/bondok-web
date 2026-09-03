'use client';

import Link from 'next/link';
import { useUI } from './ui-context';

export default function Header() {
  const { openDrawer } = useUI();

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
            <img className="logo-img" src="/bondok/logo.jpg" alt="Bondok Fried Chicken" />
          </Link>
        </div>

        <div className="header-right">
          <Link href="/rewards" className="rewards-link">
            <span className="rewards-word">Rewards</span>
          </Link>
          <button className="btn btn-outline btn-signup">Sign Up</button>
          <button className="btn btn-solid btn-bag" aria-label="View shopping bag">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M7 7V6a5 5 0 0 1 10 0v1h3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7h3zm2 0h6V6a3 3 0 0 0-6 0v1z" />
            </svg>
            <span>Bag</span>
          </button>
        </div>
      </div>
    </header>
  );
}
