'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useUI } from './ui-context';
import CloseIcon from './CloseIcon';

export default function OrderModal() {
  const { orderMode, orderClosing, switchOrder, closeOrder } = useUI();

  /* Esc closes; lock page scroll while open */
  useEffect(() => {
    if (!orderMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOrder(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [orderMode, closeOrder]);

  if (!orderMode) return null;

  return (
    <div
      className={`omodal-overlay${orderClosing ? ' closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) closeOrder(); }}
    >
      <div className="omodal" role="dialog" aria-label="Order" data-mode={orderMode}>
        <button className="omodal-close" aria-label="Close" onClick={closeOrder}>
          <CloseIcon size={18} />
        </button>

        <header className="omodal-head">
          <div className="omodal-title">
            {orderMode === 'pickup' ? (
              <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M5 4h14l-1 4H6zm1.2 6h11.6l-1.4 10H7.6zM9 2h6v1.5H9z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M19 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 11h5l2.5 3H18l3 6h-2.2l-2.3-4.5H12l-2.7-3.2L8 13.5V11zM4 13h3v1.5H4zM2 16h4v1.5H2zM4 19h3v1.5H4z" /></svg>
            )}
            <h2>{orderMode === 'pickup' ? 'Pick Up' : 'Delivery'}</h2>
          </div>
          <button className="omodal-switch" onClick={switchOrder}>
            {orderMode === 'pickup' ? 'Switch to Delivery' : 'Switch to Pickup'}
          </button>
          {orderMode === 'delivery' && (
            <div className="omodal-addr">
              <input type="text" placeholder="Enter Delivery Address" />
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#e8963d" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
            </div>
          )}
        </header>

        {orderMode === 'pickup' ? (
          <div className="omodal-pickup">
            <div className="omodal-search">
              <input type="text" placeholder="Search for a location" />
              <button className="omodal-searchbtn" aria-label="Search">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
              </button>
            </div>
            <div className="omodal-map"><span>Map</span></div>
            <div className="omodal-sheet">
              <span className="omodal-grabber" />
              <div className="omodal-card">
                <svg viewBox="0 0 24 24" width="40" height="40"><path fill="none" stroke="#e8963d" strokeWidth="1.6" d="M12 3a6 6 0 0 1 6 6c0 4-6 11-6 11S6 13 6 9a6 6 0 0 1 6-6z" /><path fill="#e8963d" d="m12 6.5.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2L9.1 8.6l2-.3z" /></svg>
                <h3>Choose Your Branch</h3>
                <p>Search for your area to find the nearest Bondok branch. Live branch data arrives with system integration.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="omodal-delivery">
            <p className="omodal-note">
              Prices and item availability may vary per branch.{' '}
              <Link href="/delivery-terms">Delivery terms and fees apply.</Link>
            </p>
            <h3 className="omodal-savedh">Saved Addresses</h3>
            <div className="omodal-card">
              <svg viewBox="0 0 24 24" width="40" height="40"><path fill="none" stroke="#e8963d" strokeWidth="1.6" d="M12 3a6 6 0 0 1 6 6c0 4-6 11-6 11S6 13 6 9a6 6 0 0 1 6-6z" /><path fill="#e8963d" d="m12 6.5.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2L9.1 8.6l2-.3z" /></svg>
              <h3>No Saved Addresses</h3>
              <p>Sign in to choose from your saved addresses.</p>
              <button className="omodal-signin">Sign In</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
