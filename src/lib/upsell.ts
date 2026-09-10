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
