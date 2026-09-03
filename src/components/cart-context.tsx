'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EVENTS, publish } from '@/lib/pubsub';

export interface CartItem {
  slug: string;          // unique product slug
  name: string;
  image: string;
  price?: number;        // EGP - undefined until client menu data arrives
  qty: number;
}

interface CartState {
  items: CartItem[];
  count: number;                       // total units
  subtotal: number | null;             // null while any item has no price
  add: (item: Omit<CartItem, 'qty'>, source?: string) => void;
  setQty: (slug: string, qty: number, source?: string) => void;
  remove: (slug: string, source?: string) => void;
  clear: (source?: string) => void;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = 'bondok-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  /* restore once on mount; persist on every change after that */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* corrupted storage: start empty */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage full/blocked */ }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, source = 'cart') => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug);
      const next = existing
        ? prev.map((i) => (i.slug === item.slug ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...item, qty: 1 }];
      const added = next.find((i) => i.slug === item.slug)!;
      publish(EVENTS.cartItemAdd, { source, item: added });
      publish(EVENTS.cartUpdate, { source, items: next, count: next.reduce((s, i) => s + i.qty, 0) });
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number, source = 'cart') => {
    setItems((prev) => {
      const next = qty <= 0
        ? prev.filter((i) => i.slug !== slug)
        : prev.map((i) => (i.slug === slug ? { ...i, qty } : i));
      publish(EVENTS.quantityUpdate, { source, slug, qty });
      publish(EVENTS.cartUpdate, { source, items: next, count: next.reduce((s, i) => s + i.qty, 0) });
      return next;
    });
  }, []);

  const remove = useCallback((slug: string, source = 'cart') => {
    setItems((prev) => {
      const next = prev.filter((i) => i.slug !== slug);
      publish(EVENTS.cartItemRemove, { source, slug });
      publish(EVENTS.cartUpdate, { source, items: next, count: next.reduce((s, i) => s + i.qty, 0) });
      return next;
    });
  }, []);

  const clear = useCallback((source = 'cart') => {
    setItems([]);
    publish(EVENTS.cartCleared, { source });
    publish(EVENTS.cartUpdate, { source, items: [], count: 0 });
  }, []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => {
    if (items.length === 0) return 0;
    if (items.some((i) => i.price === undefined)) return null;   // prices pending
    return items.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  }, [items]);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
