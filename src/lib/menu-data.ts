/* Bondok menu catalog — 8 categories, 62 products.
   Prices/descriptions arrive with the client's menu data sheet;
   in Phase 3 this file becomes the Cloud-Kitchen API adapter. */

export type Size = 'single' | 'double' | 'triple';
export type Protein = 'chicken' | 'beef' | 'shrimp' | 'turkey';

export interface Product {
  slug: string;
  name: string;
  image: string;
  price?: number;        // EGP — pending client menu data (price filter auto-enables when set)
  description?: string;  // pending client menu data
  size?: Size;           // sandwiches/burgers variants
  protein?: Protein;
  spicy?: boolean;
  cheesy?: boolean;
}

export interface MenuCategory {
  slug: string;
  name: string;
  blurb: string;
  products: Product[];
}

const img = (cat: string, slug: string) => `/bondok/menu/${cat}/${slug}.jpg`;

const baseCategories: MenuCategory[] = [
  {
    slug: 'sandwiches',
    name: 'Specialty Sandwiches',
    blurb: 'Bold flavors stacked on crispy chicken.',
    products: [
      { slug: 'chicken-cheddar-jalapeno', name: 'Chicken Cheddar Jalapeno', image: img('sandwiches', 'chicken-cheddar-jalapeno') },
      { slug: 'chicken-chili-fire', name: 'Chicken Chili Fire', image: img('sandwiches', 'chicken-chili-fire') },
      { slug: 'chicken-mozzarella', name: 'Chicken Mozzarella', image: img('sandwiches', 'chicken-mozzarella') },
      { slug: 'chicken-mushroom', name: 'Chicken Mushroom', image: img('sandwiches', 'chicken-mushroom') },
      { slug: 'roast-beef-burger', name: 'Roast Beef Burger', image: img('sandwiches', 'roast-beef-burger') },
      { slug: 'sweet-chili-burger', name: 'Sweet Chili Burger', image: img('sandwiches', 'sweet-chili-burger') },
    ],
  },
  {
    slug: 'fillet',
    name: 'Chicken Fillet',
    blurb: 'Our signature fillet - single, double, or triple.',
    products: [
      { slug: 'chicken-fillet', name: 'Chicken Fillet', image: img('fillet', 'chicken-fillet') },
      { slug: 'chicken-fillet-double', name: 'Chicken Fillet Double', image: img('fillet', 'chicken-fillet-double') },
      { slug: 'chicken-fillet-triple', name: 'Chicken Fillet Triple', image: img('fillet', 'chicken-fillet-triple') },
    ],
  },
  {
    slug: 'grilled',
    name: 'Grilled & Turkey',
    blurb: 'Grilled to perfection, lighter but loaded.',
    products: [
      { slug: 'grilled-chicken', name: 'Grilled Chicken', image: img('grilled', 'grilled-chicken') },
      { slug: 'grilled-chicken-double', name: 'Grilled Chicken Double', image: img('grilled', 'grilled-chicken-double') },
      { slug: 'grilled-chicken-triple', name: 'Grilled Chicken Triple', image: img('grilled', 'grilled-chicken-triple') },
      { slug: 'turkey-chicken', name: 'Turkey Chicken', image: img('grilled', 'turkey-chicken') },
      { slug: 'turkey-chicken-double', name: 'Turkey Chicken Double', image: img('grilled', 'turkey-chicken-double') },
      { slug: 'turkey-chicken-triple', name: 'Turkey Chicken Triple', image: img('grilled', 'turkey-chicken-triple') },
    ],
  },
  {
    slug: 'burgers',
    name: 'Burgers',
    blurb: 'Beef done the Bondok way.',
    products: [
      { slug: 'mushroom-burger', name: 'Mushroom Burger', image: img('burgers', 'mushroom-burger') },
      { slug: 'mushroom-burger-double', name: 'Mushroom Burger Double', image: img('burgers', 'mushroom-burger-double') },
      { slug: 'mushroom-burger-triple', name: 'Mushroom Burger Triple', image: img('burgers', 'mushroom-burger-triple') },
      { slug: 'texas-and-beef-burger', name: 'Texas & Beef Burger', image: img('burgers', 'texas-and-beef-burger') },
      { slug: 'texas-and-beef-burger-double', name: 'Texas & Beef Burger Double', image: img('burgers', 'texas-and-beef-burger-double') },
      { slug: 'texas-and-beef-burger-triple', name: 'Texas & Beef Burger Triple', image: img('burgers', 'texas-and-beef-burger-triple') },
      { slug: 'western-bbq-burger', name: 'Western BBQ Burger', image: img('burgers', 'western-bbq-burger') },
      { slug: 'western-bbq-burger-double', name: 'Western BBQ Burger Double', image: img('burgers', 'western-bbq-burger-double') },
      { slug: 'western-bbq-burger-triple', name: 'Western BBQ Burger Triple', image: img('burgers', 'western-bbq-burger-triple') },
    ],
  },
  {
    slug: 'rolls',
    name: 'Rolls & More',
    blurb: 'Wrapped tight, loaded with sauce.',
    products: [
      { slug: 'chicken-fillet-roll', name: 'Chicken Fillet Roll', image: img('rolls', 'chicken-fillet-roll') },
      { slug: 'grilled-chicken-roll', name: 'Grilled Chicken Roll', image: img('rolls', 'grilled-chicken-roll') },
      { slug: 'burger-roll', name: 'Burger Roll', image: img('rolls', 'burger-roll') },
      { slug: 'shrimp-roll', name: 'Shrimp Roll', image: img('rolls', 'shrimp-roll') },
      { slug: 'french-fries-roll', name: 'French Fries Roll', image: img('rolls', 'french-fries-roll') },
      { slug: 'five-star-burger', name: 'Five Star Burger', image: img('rolls', 'five-star-burger') },
      { slug: 'modern-shrimp', name: 'Modern Shrimp', image: img('rolls', 'modern-shrimp') },
    ],
  },
  {
    slug: 'meals',
    name: 'Fried Chicken Meals',
    blurb: 'Golden buckets and meals made for sharing.',
    products: [
      { slug: 'bondok-meal', name: 'Bondok Meal', image: img('meals', 'bondok-meal') },
      { slug: 'classic-meal', name: 'Classic Meal', image: img('meals', 'classic-meal') },
      { slug: 'golden-meal', name: 'Golden Meal', image: img('meals', 'golden-meal') },
      { slug: 'mega-meal', name: 'Mega Meal', image: img('meals', 'mega-meal') },
      { slug: 'bite-meal', name: 'Bite Meal', image: img('meals', 'bite-meal') },
      { slug: '12-pcs-meal', name: '12 Pcs Meal', image: img('meals', '12-pcs-meal') },
      { slug: '16-pcs-family-meal', name: '16 Pcs Family Meal', image: img('meals', '16-pcs-family-meal') },
      { slug: '20-pcs-family-meal', name: '20 Pcs Family Meal', image: img('meals', '20-pcs-family-meal') },
    ],
  },
  {
    slug: 'kids-tenders',
    name: 'Kids, Rizo & Tenders',
    blurb: 'Little meals, rice bowls, and crispy tenders.',
    products: [
      { slug: 'fried-chicken-kids-meal', name: 'Fried Chicken Kids Meal', image: img('kids-tenders', 'fried-chicken-kids-meal') },
      { slug: 'chicken-fillet-kids-meal', name: 'Chicken Fillet Kids Meal', image: img('kids-tenders', 'chicken-fillet-kids-meal') },
      { slug: 'chicken-nuggets-kids-meal', name: 'Chicken Nuggets Kids Meal', image: img('kids-tenders', 'chicken-nuggets-kids-meal') },
      { slug: 'beef-burger-kids-meal', name: 'Beef Burger Kids Meal', image: img('kids-tenders', 'beef-burger-kids-meal') },
      { slug: 'plain-rizo', name: 'Plain Rizo', image: img('kids-tenders', 'plain-rizo') },
      { slug: 'chicken-rizo', name: 'Chicken Rizo', image: img('kids-tenders', 'chicken-rizo') },
      { slug: 'grilled-chicken-rizo', name: 'Grilled Chicken Rizo', image: img('kids-tenders', 'grilled-chicken-rizo') },
      { slug: 'shrimp-rizo', name: 'Shrimp Rizo', image: img('kids-tenders', 'shrimp-rizo') },
      { slug: '4-pcs-tenders', name: '4 Pcs Tenders', image: img('kids-tenders', '4-pcs-tenders') },
      { slug: '6-pcs-tenders', name: '6 Pcs Tenders', image: img('kids-tenders', '6-pcs-tenders') },
      { slug: '12-pcs-tenders', name: '12 Pcs Tenders', image: img('kids-tenders', '12-pcs-tenders') },
    ],
  },
  {
    slug: 'sides',
    name: 'Sides & Sauces',
    blurb: 'The perfect partners for every meal.',
    products: [
      { slug: 'french-fries', name: 'French Fries', image: img('sides', 'french-fries') },
      { slug: 'cheese-fries', name: 'Cheese Fries', image: img('sides', 'cheese-fries') },
      { slug: 'mozzarella-sticks', name: 'Mozzarella Sticks', image: img('sides', 'mozzarella-sticks') },
      { slug: 'onion-rings', name: 'Onion Rings', image: img('sides', 'onion-rings') },
      { slug: 'coleslaw', name: 'Coleslaw', image: img('sides', 'coleslaw') },
      { slug: 'bbq-sauce', name: 'BBQ Sauce', image: img('sides', 'bbq-sauce') },
      { slug: 'cheese-sauce', name: 'Cheese Sauce', image: img('sides', 'cheese-sauce') },
      { slug: 'cheezy-jalapeno-sauce', name: 'Cheezy Jalapeno Sauce', image: img('sides', 'cheezy-jalapeno-sauce') },
      { slug: 'jalapeno-sauce', name: 'Jalapeno Sauce', image: img('sides', 'jalapeno-sauce') },
      { slug: 'ketchup', name: 'Ketchup', image: img('sides', 'ketchup') },
      { slug: 'mayo', name: 'Mayo', image: img('sides', 'mayo') },
      { slug: 'thoumeya-garlic-sauce', name: 'Thoumeya (Garlic Sauce)', image: img('sides', 'thoumeya-garlic-sauce') },
    ],
  },
];

/* ---- attribute enrichment: derive size / protein / taste from product data.
   Explicit values in the arrays above always win; client data can override later. */
const SIZED_CATEGORIES = new Set(['sandwiches', 'fillet', 'grilled', 'burgers']);

function enrich(p: Product, catSlug: string): Product {
  const n = p.name.toLowerCase();

  let size = p.size;
  if (!size && SIZED_CATEGORIES.has(catSlug)) {
    size = n.includes('triple') ? 'triple' : n.includes('double') ? 'double' : 'single';
  }

  let protein = p.protein;
  if (!protein && catSlug !== 'sides') {
    if (n.includes('shrimp')) protein = 'shrimp';
    else if (n.includes('turkey')) protein = 'turkey';
    else if (n.includes('beef') || catSlug === 'burgers' || n.includes('burger')) protein = 'beef';
    else if (n.includes('chicken') || n.includes('tenders') || n.includes('nuggets') || catSlug === 'fillet' || catSlug === 'meals') protein = 'chicken';
  }

  return {
    ...p,
    size,
    protein,
    spicy: p.spicy ?? /jalapeno|chili|fire/.test(n),
    cheesy: p.cheesy ?? /cheddar|mozzarella|cheese|cheezy/.test(n),
  };
}

export const menuCategories: MenuCategory[] = baseCategories.map((c) => ({
  ...c,
  products: c.products.map((p) => enrich(p, c.slug)),
}));
