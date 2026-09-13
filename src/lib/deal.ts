import type { ProductTag } from './menu-data';

/* Compare-at ("was") pricing for Hot Deal products. PLACEHOLDER: real compare-at
   prices come from the CMS / client. We derive a believable was-price from the
   live (per-branch) price so the strike-through scales with branch pricing.
   Only products tagged `hot` get a deal price. */

const DEAL_MARKUP = 1.25;   // was-price ≈ current +25% (i.e. ~20% off)

/* the struck-through original price, or null when the item isn't a hot deal */
export function compareAtOf(price: number | null | undefined, tags?: ProductTag[]): number | null {
  if (price == null || !tags?.includes('hot')) return null;
  const was = Math.round((price * DEAL_MARKUP) / 5) * 5;   // round up to a clean multiple of 5
  return was > price ? was : null;
}

/* discount percentage, e.g. 19 for "-19%" */
export function dealPct(price: number, was: number): number {
  return Math.round((1 - price / was) * 100);
}
