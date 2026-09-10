'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { EVENTS, publish } from '@/lib/pubsub';
import { useCatalog } from './catalog-context';
import { FREE_GIFT, FREE_GIFT_THRESHOLD, GIFT_KEY, PROMOS, validatePromo, promoSubtotalDiscount, type Promo } from '@/lib/upsell';

export interface CartItem {
  slug: string;          // product slug
  key?: string;          // unique cart-line id (slug + options hash); defaults to slug
  name: string;
  image: string;
  price?: number;        // EGP unit price for the active branch (base + optionsDelta); undefined until a branch is chosen
  basePrice?: number;    // branch base price of the slug (without option upcharges)
  optionsDelta?: number; // upcharge from combo/size/add-ons - branch-invariant, so price reprices cleanly on branch change
  unavailable?: boolean; // true when the active branch doesn't sell this slug
  isGift?: boolean;      // auto-added free-gift line (price 0, not repriced, excluded from subtotal)
  options?: string[];    // human-readable customization summary
  note?: string;         // kitchen note
  qty: number;
}

/* line identity: same product with different options = separate lines */
export const lineKey = (i: Pick<CartItem, 'slug' | 'key'>) => i.key ?? i.slug;
const countOf = (list: CartItem[]) => list.reduce((s, i) => s + i.qty, 0);

interface CartState {
  items: CartItem[];
  count: number;                       // total units
  subtotal: number | null;             // null while any item has no price
  hasUnavailable: boolean;             // some line isn't sold at the active branch
  promo: Promo | null;                 // applied promo (if valid for current subtotal)
  promoDiscount: number;               // EGP off the subtotal
  promoFreeship: boolean;              // waive the delivery fee
  applyPromo: (code: string) => { ok: boolean; message: string };
  clearPromo: () => void;
  add: (item: Omit<CartItem, 'qty'>, source?: string, qty?: number) => void;
  setQty: (slug: string, qty: number, source?: string) => void;
  remove: (slug: string, source?: string) => void;
  clear: (source?: string) => void;
}

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = 'bondok-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const { priceOf, branchId } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  /* mirror of `items` so cart actions can compute the next state and fire
     pubsub events synchronously in the event handler - never inside a
     setState updater (that runs during render and would setState on the
     Toaster/badge mid-render). */
  const itemsRef = useRef<CartItem[]>([]);
  const commit = useCallback((next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  /* restore once on mount; persist on every change after that */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const list: CartItem[] = JSON.parse(raw);
        /* normalize keys; the reconcile effect below prices lines against the
           active branch (nothing is priced until a branch is chosen). */
        commit(list.map((i) => ({ ...i, key: i.key ?? i.slug })));
      }
    } catch { /* corrupted storage: start empty */ }
    setLoaded(true);
  }, [commit]);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* storage full/blocked */ }
  }, [items, loaded]);

  /* Branch reconciliation: reprice every line against the active branch
     (price = branch base + optionsDelta) and flag lines the branch doesn't
     sell. Runs whenever the branch/catalog changes. Nothing is priced until a
     branch is chosen. Only commits when something actually changed. */
  useEffect(() => {
    if (!loaded) return;
    const cur = itemsRef.current;
    if (cur.length === 0) return;
    let changed = false;
    const next = cur.map((i) => {
      if (i.isGift) return i;                        // gift stays free, never repriced
      const delta = i.optionsDelta ?? 0;
      const base = branchId ? priceOf(i.slug) : undefined;
      const price = base === undefined ? undefined : base + delta;
      const unavailable = !!branchId && base === undefined;
      if (price === i.price && base === i.basePrice && unavailable === !!i.unavailable) return i;
      changed = true;
      return { ...i, price, basePrice: base, unavailable };
    });
    if (changed) {
      commit(next);
      publish(EVENTS.cartUpdate, { source: 'branch-reprice', items: next, count: countOf(next) });
    }
  }, [priceOf, branchId, loaded, commit]);

  /* Free gift: once the priced (non-gift) subtotal reaches the threshold, a free
     gift line is auto-added; it's auto-removed if the cart drops back below. */
  useEffect(() => {
    if (!loaded) return;
    const cur = itemsRef.current;
    const hasGift = cur.some((i) => i.isGift);
    const paid = cur.filter((i) => !i.isGift && !i.unavailable);
    const priced = paid.length > 0 && paid.every((i) => i.price !== undefined);
    const sub = priced ? paid.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0) : 0;
    const qualifies = !!branchId && priced && sub >= FREE_GIFT_THRESHOLD;

    if (qualifies && !hasGift) {
      const next = [...cur, { slug: FREE_GIFT.slug, key: GIFT_KEY, name: FREE_GIFT.name, image: FREE_GIFT.image, price: 0, isGift: true, qty: 1 }];
      commit(next);
      publish(EVENTS.cartUpdate, { source: 'free-gift', items: next, count: countOf(next) });
    } else if (!qualifies && hasGift) {
      const next = cur.filter((i) => !i.isGift);
      commit(next);
      publish(EVENTS.cartUpdate, { source: 'free-gift-removed', items: next, count: countOf(next) });
    }
  }, [items, branchId, loaded, commit]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, source = 'cart', qty = 1) => {
    if (qty <= 0) return;
    const prev = itemsRef.current;
    const k = lineKey(item);
    const existing = prev.find((i) => lineKey(i) === k);
    const next = existing
      ? prev.map((i) => (lineKey(i) === k ? { ...i, qty: i.qty + qty } : i))
      : [...prev, { ...item, key: k, qty, optionsDelta: item.optionsDelta ?? 0, basePrice: item.basePrice ?? item.price }];
    const result = next.find((i) => lineKey(i) === k)!;
    commit(next);
    publish(EVENTS.cartItemAdd, { source, item: result, added: qty });
    publish(EVENTS.cartUpdate, { source, items: next, count: countOf(next) });
  }, [commit]);

  const setQty = useCallback((slug: string, qty: number, source = 'cart') => {
    const prev = itemsRef.current;
    const removed = qty <= 0 ? prev.find((i) => lineKey(i) === slug) : undefined;
    const next = qty <= 0
      ? prev.filter((i) => lineKey(i) !== slug)
      : prev.map((i) => (lineKey(i) === slug ? { ...i, qty } : i));
    commit(next);
    if (removed) publish(EVENTS.cartItemRemove, { source, slug, item: removed });
    else publish(EVENTS.quantityUpdate, { source, slug, qty });
    publish(EVENTS.cartUpdate, { source, items: next, count: countOf(next) });
  }, [commit]);

  const remove = useCallback((slug: string, source = 'cart') => {
    const prev = itemsRef.current;
    const removed = prev.find((i) => lineKey(i) === slug);
    const next = prev.filter((i) => lineKey(i) !== slug);
    commit(next);
    publish(EVENTS.cartItemRemove, { source, slug, item: removed });
    publish(EVENTS.cartUpdate, { source, items: next, count: countOf(next) });
  }, [commit]);

  const clear = useCallback((source = 'cart') => {
    commit([]);
    setPromoCode(null);
    publish(EVENTS.cartCleared, { source });
    publish(EVENTS.cartUpdate, { source, items: [], count: 0 });
  }, [commit]);

  const count = useMemo(() => items.reduce((s, i) => s + (i.isGift ? 0 : i.qty), 0), [items]);
  const hasUnavailable = useMemo(() => items.some((i) => i.unavailable), [items]);
  const subtotal = useMemo(() => {
    if (items.length === 0) return 0;
    const charge = items.filter((i) => !i.unavailable && !i.isGift);
    if (charge.length === 0) return null;                        // everything unavailable at this branch
    if (charge.some((i) => i.price === undefined)) return null;  // no branch chosen / prices pending
    return charge.reduce((s, i) => s + (i.price ?? 0) * i.qty, 0);
  }, [items]);

  /* promo: valid only while the cart still meets its minimum */
  const promo = promoCode ? PROMOS[promoCode] ?? null : null;
  const promoValid = !!promo && !(promo.min && (subtotal ?? 0) < promo.min);
  const promoDiscount = useMemo(
    () => (promoValid ? promoSubtotalDiscount(promo, subtotal ?? 0) : 0),
    [promo, promoValid, subtotal],
  );
  const promoFreeship = promoValid && promo!.kind === 'freeship';

  const applyPromo = useCallback((code: string) => {
    const { promo: p, message } = validatePromo(code, subtotal ?? 0);
    if (p) setPromoCode(p.code);
    return { ok: !!p, message };
  }, [subtotal]);
  const clearPromo = useCallback(() => setPromoCode(null), []);

  return (
    <CartContext.Provider value={{
      items, count, subtotal, hasUnavailable,
      promo: promoValid ? promo : null, promoDiscount, promoFreeship, applyPromo, clearPromo,
      add, setQty, remove, clear,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
