/* Per-product customization config - rule-based for now (SAMPLE deltas
   until client menu pricing arrives). In Phase 3 the Cloud-Kitchen API /
   CMS defines each product's real option groups, combo contents, and
   prices; components read the same shapes so nothing changes. */

import type { Product } from './menu-data';

export interface OptionChoice {
  label: string;
  delta: number;          // EGP added to the base price (SAMPLE values)
}

export interface OptionGroup {
  key: string;
  label: string;
  type: 'single' | 'multi';
  choices: OptionChoice[];
  defaultIdx?: number;    // single-select default
}

export interface ProductConfig {
  badge?: string;                                   // gallery corner badge
  combo?: { delta: number; includes: string };      // "Make it a combo"
  groups: OptionGroup[];
}

const MAINS = new Set(['sandwiches', 'fillet', 'grilled', 'burgers', 'rolls']);
const PLATTERS = new Set(['meals', 'kids-tenders']);

const SIZE: OptionGroup = {
  key: 'size',
  label: 'Choose Size',
  type: 'single',
  defaultIdx: 0,
  choices: [
    { label: 'Regular', delta: 0 },
    { label: 'Large', delta: 20 },
    { label: 'Extra Large', delta: 35 },
  ],
};

const HEAT: OptionGroup = {
  key: 'heat',
  label: 'Spicy Level',
  type: 'single',
  defaultIdx: 1,
  choices: [
    { label: 'Mild', delta: 0 },
    { label: 'Medium', delta: 0 },
    { label: 'Hot', delta: 0 },
    { label: 'Extra Hot', delta: 0 },
  ],
};

const DIPS: OptionGroup = {
  key: 'dip',
  label: 'Choose Your Sauce',
  type: 'single',
  defaultIdx: 0,
  choices: [
    { label: 'Signature', delta: 0 },
    { label: 'Ranch', delta: 0 },
    { label: 'BBQ', delta: 0 },
    { label: 'Spicy Mayo', delta: 0 },
  ],
};

const ADDONS: OptionGroup = {
  key: 'addons',
  label: 'Custom Add-ons',
  type: 'multi',
  choices: [
    { label: 'Extra Sharp Cheddar Cheese', delta: 15 },
    { label: 'Smoked Beef Strips', delta: 20 },
    { label: 'Extra Pickled Jalapeños', delta: 10 },
    { label: 'Side Signature Dip Sauce', delta: 5 },
  ],
};

const SIDE_ADDONS: OptionGroup = {
  key: 'addons',
  label: 'Custom Add-ons',
  type: 'multi',
  choices: [
    { label: 'Extra Cheese Sauce', delta: 10 },
    { label: 'Extra Pickled Jalapeños', delta: 10 },
    { label: 'Side Signature Dip Sauce', delta: 5 },
  ],
};

export function optionsFor(product: Product, catSlug: string): ProductConfig {
  const groups: OptionGroup[] = [];
  let combo: ProductConfig['combo'];
  let badge: string | undefined;

  if (product.spicy) badge = 'Hot & Spicy';

  if (MAINS.has(catSlug)) {
    groups.push(SIZE);
    if (product.spicy) groups.push(HEAT);
    groups.push(DIPS, ADDONS);
    combo = { delta: 80, includes: 'Medium Fries + Soft Drink' };
  } else if (PLATTERS.has(catSlug)) {
    if (product.spicy) groups.push(HEAT);
    groups.push(DIPS, ADDONS);
  } else if (catSlug === 'sides' && !product.slug.includes('sauce')) {
    groups.push(SIDE_ADDONS);
  } else if (product.spicy) {
    groups.push(HEAT);
  }

  return { badge, combo, groups };
}
