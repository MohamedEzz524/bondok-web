/* Bondok offers - empty until the client defines the first campaigns.
   Each entry renders on /offers and can power promo cards site-wide. */

export interface Offer {
  id: string;
  title: string;
  text: string;
  image: string;
  href: string;          // deep link (product/category/combo)
}

export const offers: Offer[] = [];
