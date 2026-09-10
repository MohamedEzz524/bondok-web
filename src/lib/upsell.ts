/* Upsell / cross-sell suggestion engine - Stage-1 rules.
   Later this becomes CMS-configurable and analytics-driven
   ("frequently bought together" from real order data). */

import { menuCategories, type Product } from './menu-data';

/* free-delivery threshold (EGP). The progress bar activates automatically
   once cart items carry real prices; value is CMS-configurable later. */
export const FREE_DELIVERY_THRESHOLD = 300;

/* free-gift threshold (EGP): spend this much (excluding the gift itself) and a
   free item is auto-added to the cart. PLACEHOLDER gift + value — CMS-driven,
   per-branch later. GIFT_KEY keeps the gift a distinct, non-mergeable line. */
export const FREE_GIFT_THRESHOLD = 450;
export const GIFT_KEY = '__free_gift__';
export const FREE_GIFT = {
  slug: 'french-fries',
  name: 'Free French Fries',
  image: '/bondok/menu/sides/french-fries.webp',
};

/* flat delivery fee (EGP), waived over the free-delivery threshold. Per-branch later. */
export const DELIVERY_FEE = 25;

/* DEMO promo codes. kind: percent (off subtotal), flat (EGP off, needs `min`),
   freeship (waive delivery). Replaced by the offers engine later. */
export interface Promo { code: string; label: string; kind: 'percent' | 'flat' | 'freeship'; value: number; min?: number; }
export const PROMOS: Record<string, Promo> = {
  BONDOK10: { code: 'BONDOK10', label: '10% off your order', kind: 'percent', value: 10 },
  WELCOME50: { code: 'WELCOME50', label: 'EGP 50 off (min EGP 300)', kind: 'flat', value: 50, min: 300 },
  FREESHIP: { code: 'FREESHIP', label: 'Free delivery', kind: 'freeship', value: 0 },
};

/* validate a code against the subtotal; returns the promo or an error message */
export function validatePromo(raw: string, subtotal: number): { promo: Promo | null; message: string } {
  const promo = PROMOS[raw.trim().toUpperCase()];
  if (!promo) return { promo: null, message: 'That code isn’t valid. Try BONDOK10, WELCOME50 or FREESHIP.' };
  if (promo.min && subtotal < promo.min) return { promo: null, message: `Spend at least EGP ${promo.min} to use ${promo.code}.` };
  return { promo, message: `${promo.code} applied — ${promo.label}.` };
}

/* discount off the subtotal (freeship discounts delivery, handled separately) */
export function promoSubtotalDiscount(promo: Promo | null, subtotal: number): number {
  if (!promo) return 0;
  if (promo.kind === 'percent') return Math.round((subtotal * promo.value) / 100);
  if (promo.kind === 'flat') return Math.min(promo.value, subtotal);
  return 0;
}

const bySlug = new Map<string, { catSlug: string; product: Product }>();
for (const c of menuCategories) {
  for (const p of c.products) bySlug.set(p.slug, { catSlug: c.slug, product: p });
}

export function findProduct(slug: string) {
  return bySlug.get(slug) ?? null;
}

/* main-dish categories get sides/sauces suggested; sides get bestsellers */
const MAINS = new Set(['sandwiches', 'fillet', 'grilled', 'burgers', 'rolls', 'meals', 'kids-tenders']);

const SIDE_PICKS = ['french-fries', 'cheese-fries', 'coleslaw', 'onion-rings', 'mozzarella-sticks'];
const SAUCE_PICKS = ['cheese-sauce', 'bbq-sauce', 'thoumeya-garlic-sauce'];
const MAIN_PICKS = ['chicken-fillet', '6-pcs-tenders', 'texas-and-beef-burger'];

function resolve(slugs: string[], exclude: Set<string>, limit: number): Product[] {
  const out: Product[] = [];
  for (const s of slugs) {
    if (out.length >= limit) break;
    if (exclude.has(s)) continue;
    const hit = bySlug.get(s);
    if (hit) out.push(hit.product);
  }
  return out;
}

/* product page / popup: "frequently bought together" */
export function suggestFor(productSlug: string, limit = 3): Product[] {
  const hit = bySlug.get(productSlug);
  if (!hit) return [];
  const exclude = new Set([productSlug]);
  const pool = MAINS.has(hit.catSlug)
    ? [...SIDE_PICKS, ...SAUCE_PICKS]
    : [...MAIN_PICKS, ...SIDE_PICKS];
  return resolve(pool, exclude, limit);
}

/* bag: "complete your meal" - skips anything already in the cart */
export function suggestForCart(cartSlugs: string[], limit = 4): Product[] {
  const exclude = new Set(cartSlugs);
  const hasMain = cartSlugs.some((s) => {
    const hit = bySlug.get(s);
    return hit ? MAINS.has(hit.catSlug) : false;
  });
  const pool = hasMain
    ? [...SIDE_PICKS, ...SAUCE_PICKS, ...MAIN_PICKS]
    : [...MAIN_PICKS, ...SIDE_PICKS, ...SAUCE_PICKS];
  return resolve(pool, exclude, limit);
}
