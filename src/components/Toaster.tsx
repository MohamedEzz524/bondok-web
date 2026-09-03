'use client';

import { useCallback, useRef, useState } from 'react';
import { EVENTS, useSubscribe } from '@/lib/pubsub';

interface Toast { id: number; text: string; }

/* Listens on the event bus - no direct coupling to whatever added the item */
export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  useSubscribe(EVENTS.cartItemAdd, useCallback((d) => push(`${d.item.name} added to bag`), [push]));
  useSubscribe(EVENTS.cartItemRemove, useCallback(() => push('Removed from bag'), [push]));
  useSubscribe(EVENTS.cartError, useCallback((d) => push(d.message), [push]));

  if (toasts.length === 0) return null;

  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
          </svg>
          {t.text}
        </div>
      ))}
    </div>
  );
}
