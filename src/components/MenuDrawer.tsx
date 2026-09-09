'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUI } from './ui-context';
import CloseIcon from './CloseIcon';

export default function MenuDrawer() {
  const { drawerOpen, closeDrawer } = useUI();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;

  return (
    <div className="drawer-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}>
      <aside className="drawer" role="dialog" aria-label="Menu">
        <button className="drawer-close icon-btn" aria-label="Close menu" onClick={closeDrawer}>
          <CloseIcon size={24} />
        </button>

        <div className="drawer-brand">
          <span className="drawer-brand-top">Bondok</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="drawer-rewards-img" src="/bondok/rewards.webp" alt="Rewards" />
        </div>
        <p className="drawer-tag">More chicken, more smiles. Start earning rewards today!</p>

        <button className="btn btn-solid drawer-cta">Log In</button>
        <button className="btn btn-outline drawer-cta">Sign Up</button>

        <Link className="drawer-row" href="/branches" onClick={closeDrawer}>
          <span className="drawer-ic">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
          </span>
          Find a Branch
        </Link>
        <Link className="drawer-row" href="/menu?fav=1" onClick={closeDrawer}>
          <span className="drawer-ic">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 21s-7.1-4.4-9.5-8.2C.7 9.9 1.6 6.4 4.7 5.3c2-.7 4 .1 5.8 2 .5.6 1 .6 1.5 0 1.8-1.9 3.8-2.7 5.8-2 3.1 1.1 4 4.6 2.2 7.5C17.1 16.6 12 21 12 21z" /></svg>
          </span>
          My Favorites
        </Link>
        <Link className="drawer-row" href="/complaints" onClick={closeDrawer}>
          <span className="drawer-ic">
            <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1z" /></svg>
          </span>
          Contact Us
        </Link>

        <div className="drawer-box drawer-box-inline">
          <Link href="/catering" onClick={closeDrawer}>
            <span className="drawer-ic"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 3a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5zM4 10h16v2H4zm2 3h12l-1 8H7z" /></svg></span>
            Catering
          </Link>
          <Link href="/offers" onClick={closeDrawer}>
            <span className="drawer-ic"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M20.6 11 13 3.4A2 2 0 0 0 11.6 3H5a2 2 0 0 0-2 2v6.6a2 2 0 0 0 .6 1.4L11.2 20.6a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8zM7.5 8A1.5 1.5 0 1 1 7.5 5a1.5 1.5 0 0 1 0 3z" /></svg></span>
            Offers
          </Link>
          <Link href="/faq" onClick={closeDrawer}>
            <span className="drawer-ic"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" strokeWidth="2" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.35-1 .9-1 1.7M12 17h.01" /></svg></span>
            FAQs
          </Link>
        </div>

        <div className="drawer-box drawer-legal-links">
          <Link href="/terms" onClick={closeDrawer}>Legal Terms &amp; Policies</Link>
          <Link href="/careers" onClick={closeDrawer}>We&apos;re Hiring</Link>
          <Link href="/branches" onClick={closeDrawer}>All Branches</Link>
          <Link href="/complaints" onClick={closeDrawer}>Complaints &amp; Suggestions</Link>
        </div>

        <p className="drawer-legaltext">
          Product availability, prices, offers and discounts may vary per branch.{' '}
          &copy; 2026 Bondok Fried Chicken. All rights reserved. Prices may vary.{' '}
          All pictures are shown for illustrative purposes only. Actual product may vary.
        </p>
      </aside>
    </div>
  );
}
