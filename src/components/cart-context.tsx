'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { EVENTS, publish } from '@/lib/pubsub';

export interface CartItem {
  slug: string;          // product slug
  key?: string;          // unique cart-line id (slug + options hash); defaults to slug
  name: string;
  image: string;
  price?: number;        // EGP unit price incl. option deltas - undefined until menu data
  options?: string[];    // human-readable customization summary
  note?: string;         // kitchen note
  qty: number;
}

/* line identity: same product with different options = separate lines */
export const lineKey = (i: Pick<CartItem, 'slug' | 'key'>) => i.key ?? i.slug;

interface CartState {
  items: CartItem[];
  count: number;                       // total units
  subtotal: number | null;             // null while any item has no price
  add: (item: Omit<CartItem, 'qty'>, source?: string, qty?: number) => void;
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
      if (raw) {
        const list: CartItem[] = JSON.parse(raw);
        setItems(list.map((i) => ({ ...i, key: i.key ?? i.slug })));
      }
    } catch { /* corrupted storage: start empty */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage full/blocked */ }
  }, [items, loaded]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, source = 'cart', qty = 1) => {
    if (qty <= 0) return;
    setItems((prev) => {
      const k = lineKey(item);
      const existing = prev.find((i) => lineKey(i) === k);
      const next = existing
        ? prev.map((i) => (lineKey(i) === k ? { ...i, qty: i.qty + qty } : i))
        : [...prev, { ...item, key: k, qty }];
      const result = next.find((i) => lineKey(i) === k)!;
      publish(EVENTS.cartItemAdd, { source, item: result, added: qty });
      publish(EVENTS.cartUpdate, { source, items: next, count: next.reduce((s, i) => s + i.qty, 0) });
      return next;
    });
  }, []);

  const setQty = useCallback((slug: string, qty: number, source = 'cart') => {
    setItems((prev) => {
      const removed = qty <= 0 ? prev.find((i) => lineKey(i) === slug) : undefined;
      const next = qty <= 0
        ? prev.filter((i) => lineKey(i) !== slug)
        : prev.map((i) => (lineKey(i) === slug ? { ...i, qty } : i));
      if (removed) publish(EVENTS.cartItemRemove, { source, slug, item: removed });
      else publish(EVENTS.quantityUpdate, { source, slug, qty });
      publish(EVENTS.cartUpdate, { source, items: next, count: next.reduce((s, i) => s + i.qty, 0) });
      return next;
    });
  }, []);

  const remove = useCallback((slug: string, source = 'cart') => {
    setItems((prev) => {
      const removed = prev.find((i) => lineKey(i) === slug);
      const next = prev.filter((i) => lineKey(i) !== slug);
      publish(EVENTS.cartItemRemove, { source, slug, item: removed });
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
