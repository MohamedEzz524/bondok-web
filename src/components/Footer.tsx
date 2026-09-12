'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { footerLinks } from '@/lib/data';
import { useUI } from './ui-context';

/* these footer entries open the doc popup instead of navigating */
const DOC_KEYS: Record<string, string> = {
  '/faq': 'faq',
  '/terms': 'terms',
  '/privacy': 'privacy',
  '/delivery-terms': 'delivery-terms',
  '/offer-terms': 'offer-terms',
};

export default function Footer() {
  const { openDoc } = useUI();
  const pathname = usePathname();
  /* /catering is a standalone landing with its own chrome (reference behavior) */
  if (pathname === '/catering') return null;
  return (
    <footer className="site-footer">
      <div className="footer-inner u-container">
        <ul className="footer-links">
          {footerLinks.map((l) => (
            <li key={l.label}>
              {DOC_KEYS[l.href] ? (
                <button className="footer-linkbtn" onClick={() => openDoc(DOC_KEYS[l.href])}>{l.label}</button>
              ) : (
                <Link href={l.href}>{l.label}</Link>
              )}
            </li>
          ))}
        </ul>

        <div className="footer-legal">
          <p>All pictures are shown for illustrative purposes only. Actual product may vary.</p>
          <p>&copy; 2026 Bondok Fried Chicken. All rights reserved.</p>
          <p>Prices may vary per branch</p>
        </div>

        <div className="footer-social">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="footer-logo-img" src="/bondok/logo.webp" alt="Bondok Fried Chicken" />
          <div className="social-icons">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" /></svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12v-3.15a5.76 5.76 0 0 0-.78-.05 5.74 5.74 0 1 0 5.74 5.74V9.66a7.35 7.35 0 0 0 4.28 1.37V7.94a4.3 4.3 0 0 1-3.28-2.12z" /></svg>
            </a>
            <a href="#" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.35A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.13c-.25-.13-1.47-.72-1.7-.8-.22-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.17.04-.31-.02-.44-.07-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.43h-.47c-.17 0-.44.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1 2.57.13.17 1.75 2.67 4.23 3.74.6.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
