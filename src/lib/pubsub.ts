/* ============================================================
   Bondok event bus — the app's main communication backbone.
   Modeled on the Dawn-style theme pubsub (subscribe returns an
   unsubscribe fn; every payload carries a `source` tag so
   subscribers can ignore events they published themselves and
   avoid feedback loops), upgraded to TypeScript with typed
   payloads per event.

   Usage:
     publish(EVENTS.cartItemAdd, { source: 'menu-page', item });
     const unsub = subscribe(EVENTS.cartItemAdd, (d) => { ... });

   React components should prefer the useSubscribe hook, which
   unsubscribes automatically on unmount.
   ============================================================ */

import { useEffect } from 'react';
import type { CartItem } from '@/components/cart-context';

export const EVENTS = {
  /* cart */
  cartUpdate: 'cart-update',            // any cart change (items snapshot)
  cartItemAdd: 'cart-item-add',
  cartItemRemove: 'cart-item-remove',
  quantityUpdate: 'quantity-update',
  cartCleared: 'cart-cleared',
  cartError: 'cart-error',
  /* browsing */
  search: 'search',                     // menu search performed
  filterChange: 'filter-change',        // menu filters changed
  /* ui surfaces */
  modalOpen: 'modal-open',              // order modal / drawers
  modalClose: 'modal-close',
  /* checkout (wired when the flow is built) */
  checkoutStart: 'checkout-start',
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/* every payload carries the publisher's identity */
interface Base { source: string; }

export interface EventPayloads {
  [EVENTS.cartUpdate]: Base & { items: CartItem[]; count: number };
  [EVENTS.cartItemAdd]: Base & { item: CartItem };
  [EVENTS.cartItemRemove]: Base & { slug: string };
  [EVENTS.quantityUpdate]: Base & { slug: string; qty: number };
  [EVENTS.cartCleared]: Base;
  [EVENTS.cartError]: Base & { message: string };
  [EVENTS.search]: Base & { query: string; results: number };
  [EVENTS.filterChange]: Base & { active: number };
  [EVENTS.modalOpen]: Base & { name: string };
  [EVENTS.modalClose]: Base & { name: string };
  [EVENTS.checkoutStart]: Base & { count: number };
}

type Callback<E extends EventName> = (data: EventPayloads[E]) => void;

/* internal store is loosely typed; the public API stays fully typed */
const subscribers: Partial<Record<EventName, unknown[]>> = {};

export function subscribe<E extends EventName>(event: E, callback: Callback<E>): () => void {
  const list = (subscribers[event] ??= []) as Callback<E>[];
  list.push(callback);
  return function unsubscribe() {
    subscribers[event] = (subscribers[event] as Callback<E>[]).filter((cb) => cb !== callback);
  };
}

export function publish<E extends EventName>(event: E, data: EventPayloads[E]): void {
  (subscribers[event] as Callback<E>[] | undefined)?.forEach((cb) => {
    try { cb(data); } catch (err) { console.error(`[pubsub] subscriber error on "${event}"`, err); }
  });
}

/* React helper: auto-unsubscribes on unmount */
export function useSubscribe<E extends EventName>(event: E, callback: Callback<E>): void {
  useEffect(() => subscribe(event, callback), [event, callback]);
}
