/* DEMO order store — persists placed orders to localStorage so the confirmation
   (/order?id=…) survives refresh and the history (/orders) works. No backend;
   when the real Orders API lands these four helpers become fetch calls. */

export type OrderStatus = 'confirmed' | 'preparing' | 'on-the-way' | 'delivered';

export interface OrderLine {
  slug: string;
  name: string;
  image: string;
  qty: number;
  price?: number;
  isGift?: boolean;
  options?: string[];
}

export interface Order {
  id: string;
  createdAt: string;              // ISO
  status: OrderStatus;
  mode: 'delivery' | 'pickup';
  name: string;
  phone: string;
  address?: string;               // delivery
  branch?: string;                // branch id (pickup or delivering branch)
  payment: 'card' | 'cod' | 'wallet';
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  eta: string;                    // e.g. "25–40 min"
}

const KEY = 'bondok-orders-v1';

export function getOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function getOrder(id: string): Order | null {
  return getOrders().find((o) => o.id === id) ?? null;
}

export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getOrders();
    all.unshift(order);
    localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
  } catch { /* storage blocked */ }
}

/* demo "live" status derived from how long ago the order was placed */
export const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'on-the-way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

export function liveStatusIndex(order: Order, now: number): number {
  const mins = (now - new Date(order.createdAt).getTime()) / 60000;
  if (mins < 2) return 0;
  if (mins < 8) return 1;
  if (mins < 20) return 2;
  return 3;
}
