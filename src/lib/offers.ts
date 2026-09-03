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
    mode: 'pickup',
    sample: true,
  },
  {
    id: 'sample-bucket',
    title: '12 Pcs Bucket',
    text: 'Made for sharing - golden, crispy, and generous.',
    image: '/bondok/hero-12pcs.webp',
    href: '/menu/meals/12-pcs-meal',
    mode: 'delivery',
    sample: true,
  },
];
