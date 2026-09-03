/* Bondok content data.
   For now this is static; in Phase 3 it becomes the Cloud-Kitchen API
   adapter (Foodics / Matrix compatible) so components never change. */

export interface HeroSlide {
  title: string;
  text: string;
  cta: string;
  image: string;
  alt: string;
  href: string;
}

export interface FavoriteItem {
  title: string;
  image: string;
  alt: string;
  href: string;
}

export interface FeatureCard {
  title: string;
  text: string;
  cta: string;
  image: string;
  alt: string;
  href: string;
}

export const heroSlides: HeroSlide[] = [
  {
    title: '12 Pcs Bucket',
    text: 'Golden, crispy fried chicken - made for sharing with the whole family.',
    cta: 'Order Now',
    image: '/bondok/hero-12pcs.png',
    alt: '12 Pcs Meal',
    href: '/menu/meals/12-pcs-meal',
  },
  {
    title: 'NEW Shrimp Roll',
    text: 'Crunchy shrimp, bold sauce, soft roll. Try it today.',
    cta: 'Order Now',
    image: '/bondok/hero-shrimp-roll.png',
    alt: 'Shrimp Roll',
    href: '/menu/rolls/shrimp-roll',
  },
  {
    title: '12 Tenders Feast',
    text: 'Crispy tenders stacked high - dip into every flavor.',
    cta: 'Order Now',
    image: '/bondok/hero-tenders.png',
    alt: '12 Pcs Tenders',
    href: '/menu/kids-tenders/12-pcs-tenders',
  },
];

export const favorites: FavoriteItem[] = [
  { title: 'Chicken Fillet Sandwich', image: '/bondok/fav-chicken-fillet.png', alt: 'Chicken Fillet Sandwich', href: '/menu' },
  { title: '6 Pcs Tenders', image: '/bondok/fav-tenders.png', alt: '6 Pcs Tenders', href: '/menu' },
  { title: 'Cheddar Jalapeno', image: '/bondok/fav-cheddar-jalapeno.png', alt: 'Chicken Cheddar Jalapeno', href: '/menu' },
  { title: 'Texas & Beef Burger', image: '/bondok/fav-texas-burger.png', alt: 'Texas and Beef Burger', href: '/menu' },
];

export const featureCards: FeatureCard[] = [
  {
    title: 'Rolled & Loaded',
    text: 'Crispy chicken fillet wrapped tight with our signature sauces. Grab yours today.',
    cta: 'Order Now',
    image: '/bondok/feat-rolls.png',
    alt: 'Chicken Fillet Roll',
    href: '/menu',
  },
  {
    title: 'Meals Made for Sharing',
    text: '12, 16, or 20 pieces of golden fried chicken with sides for the whole table.',
    cta: 'Order Now',
    image: '/bondok/feat-family.png',
    alt: '16 Pcs Family Meal',
    href: '/menu',
  },
  {
    title: 'Little Bondok Meals',
    text: 'Kid-sized favorites with nuggets, fillet, or fried chicken. Smiles included.',
    cta: 'Order Now',
    image: '/bondok/feat-kids.png',
    alt: 'Kids Meal',
    href: '/menu',
  },
  {
    title: 'Sides & Sauces',
    text: 'Cheese fries, mozzarella sticks, onion rings, and our famous sauce lineup.',
    cta: 'See the Menu',
    image: '/bondok/feat-sides.png',
    alt: 'Cheese Fries',
    href: '/menu',
  },
];

export const footerLinks: { label: string; href: string }[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Offers', href: '/offers' },
  { label: 'Support', href: '/support' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Our Branches', href: '/branches' },
  { label: 'Catering', href: '/catering' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Delivery Terms', href: '/delivery-terms' },
  { label: 'Offer Terms', href: '/offer-terms' },
  { label: 'Complaints & Suggestions', href: '/complaints' },
];
