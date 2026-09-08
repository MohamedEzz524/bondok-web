/* Bondok offers.
   SAMPLE DATA: these placeholder offers show the page structure using our
   own products; the client's real campaigns replace them (or the CMS
   manages them later). Prices appear once menu pricing arrives. */

export interface Offer {
  id: string;
  title: string;
  text: string;
  image: string;
  href: string;            // deep link (product/category/combo)
  badge?: string;          // e.g. "WELCOME DEAL", "LIMITED TIME"
  fromPrice?: number;      // EGP
  mode?: 'pickup' | 'delivery';
  sample?: boolean;        // placeholder flag
}

export const offers: Offer[] = [
  {
    id: 'sample-family',
    title: 'Family Feast Deal',
    text: '16 pieces of golden fried chicken with sides for the whole table.',
    image: '/bondok/feat-family.webp',
    href: '/menu/meals/16-pcs-family-meal',
    badge: 'WELCOME DEAL',
    mode: 'pickup',
    sample: true,
  },
  {
    id: 'sample-tenders',
    title: '12 Tenders Feast',
    text: 'Crispy tenders stacked high - dip into every flavor.',
    image: '/bondok/hero-tenders.webp',
    href: '/menu/kids-tenders/12-pcs-tenders',
    badge: 'LIMITED TIME',
    mode: 'delivery',
    sample: true,
  },
  {
    id: 'sample-shrimp',
    title: 'NEW Shrimp Roll',
    text: 'Crunchy shrimp, bold sauce, soft roll. Try it today.',
    image: '/bondok/hero-shrimp-roll.webp',
    href: '/menu/rolls/shrimp-roll',
    sample: true,
  },
  {
    id: 'sample-fillet',
    title: '25% Off Chicken Fillet Sandwich',
    text: 'Juicy fillet, fresh bun, your pick of sauce.',
    image: '/bondok/fav-chicken-fillet.webp',
    href: '/menu/fillet/chicken-fillet',
    sample: true,
  },
  {
    id: 'sample-bucket-pickup',
    title: '12 Pcs Bucket',
    text: 'Made for sharing - golden, crispy, and generous.',
    image: '/bondok/hero-12pcs.webp',
    href: '/menu/meals/12-pcs-meal',
    fromPrice: 420,
    mode: 'pickup',
    sample: true,
  },
  {
    id: 'sample-tenders-pickup',
    title: '6 Pcs Tenders Combo',
    text: '6 tenders, a regular side, and a drink.',
    image: '/bondok/fav-tenders.webp',
    href: '/menu/kids-tenders/6-pcs-tenders',
    fromPrice: 185,
    mode: 'pickup',
    sample: true,
  },
  {
    id: 'sample-bucket-delivery',
    title: '12 Pcs Bucket',
    text: 'Made for sharing - golden, crispy, and generous.',
    image: '/bondok/hero-12pcs.webp',
    href: '/menu/meals/12-pcs-meal',
    fromPrice: 450,
    mode: 'delivery',
    sample: true,
  },
  {
    id: 'sample-texas-delivery',
    title: 'Texas Burger Combo',
    text: 'Crunchy, saucy, stacked - with fries and a drink.',
    image: '/bondok/fav-texas-burger.webp',
    href: '/menu/burgers/texas-and-beef-burger',
    fromPrice: 210,
    mode: 'delivery',
    sample: true,
  },
];
