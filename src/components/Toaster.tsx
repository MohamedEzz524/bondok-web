'use client';

import { useCallback, useRef, useState } from 'react';
import { EVENTS, useSubscribe } from '@/lib/pubsub';

const TOAST_MS = 2600;

interface Toast {
  id: number;
  text: string;
  image?: string;
  qty?: number;
  kind?: 'add' | 'remove';
}

/* Listens on the event bus - no coupling to whatever added the item */
export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), TOAST_MS);
  }, []);

  useSubscribe(EVENTS.cartItemAdd, useCallback((d) => {
    push({ text: d.item.name, image: d.item.image, qty: d.added, kind: 'add' });
  }, [push]));
  useSubscribe(EVENTS.cartItemRemove, useCallback((d) => {
    push({ text: d.item?.name ?? 'Item', image: d.item?.image, kind: 'remove' });
  }, [push]));
  useSubscribe(EVENTS.cartError, useCallback((d) => push({ text: d.message }), [push]));

  if (toasts.length === 0) return null;

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast${t.kind === 'remove' ? ' is-remove' : ''}`}>
          <div className="toast-body">
            {t.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className="toast-img" src={t.image} alt="" />
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
              </svg>
            )}
            <div className="toast-text">
              <strong>{t.text}{t.qty && t.qty > 1 ? ` ×${t.qty}` : ''}</strong>
              {t.image && <span>{t.kind === 'remove' ? 'Removed from bag' : 'Added to bag'}</span>}
            </div>
          </div>
          <span className="toast-bar" style={{ animationDuration: `${TOAST_MS}ms` }} />
        </div>
      ))}
    </div>
  );
}
