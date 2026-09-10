/* Per-product customization config - rule-based for now (SAMPLE deltas
   until client menu pricing arrives). In Phase 3 the Cloud-Kitchen API /
   CMS defines each product's real option groups, combo contents, and
   prices; components read the same shapes so nothing changes. */

import type { Product } from './menu-data';

export interface OptionChoice {
  label: string;
  delta: number;          // EGP added to the base price (SAMPLE values)
  image?: string;         // thumbnail (reuses real menu images where it maps)
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
  combo?: { delta: number; includes: string; items?: { label: string; image: string }[] };   // "Make it a combo"
  groups: OptionGroup[];
}

const S = '/bondok/menu/sides/';   // sauces/sides thumbnails reused for options

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
    { label: 'BBQ', delta: 0, image: S + 'bbq-sauce.webp' },
    { label: 'Garlic', delta: 0, image: S + 'thoumeya-garlic-sauce.webp' },
    { label: 'Cheese', delta: 0, image: S + 'cheese-sauce.webp' },
    { label: 'Spicy Mayo', delta: 0, image: S + 'mayo.webp' },
  ],
};

const ADDONS: OptionGroup = {
  key: 'addons',
  label: 'Custom Add-ons',
  type: 'multi',
  choices: [
    { label: 'Extra Cheese Sauce', delta: 15, image: S + 'cheese-sauce.webp' },
    { label: 'Extra Jalapeños', delta: 10, image: S + 'jalapeno-sauce.webp' },
    { label: 'Side Coleslaw', delta: 15, image: S + 'coleslaw.webp' },
    { label: 'Signature Dip', delta: 5, image: S + 'bbq-sauce.webp' },
  ],
};

const SIDE_ADDONS: OptionGroup = {
  key: 'addons',
  label: 'Custom Add-ons',
  type: 'multi',
  choices: [
    { label: 'Extra Cheese Sauce', delta: 10, image: S + 'cheese-sauce.webp' },
    { label: 'Extra Jalapeños', delta: 10, image: S + 'jalapeno-sauce.webp' },
    { label: 'Signature Dip', delta: 5, image: S + 'bbq-sauce.webp' },
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
    combo = { delta: 80, includes: 'Medium Fries + Soft Drink', items: [{ label: 'Fries', image: S + 'french-fries.webp' }, { label: 'Soft Drink', image: S + 'soft-drink.webp' }] };
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
