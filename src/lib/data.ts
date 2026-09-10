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
  /* final marketing art with copy baked in - render image-only, no overlay */
  full?: boolean;
  /* product cutout used by the menu promo cards (full banners crop badly there) */
  card?: string;
  /* square, food-focused crop for mobile (wide banner crops badly on phones);
     mobile shows this + an HTML title/CTA overlay */
  mobileImage?: string;
}

export interface FavoriteItem {
  title: string;
  image: string;
  alt: string;
  href: string;
}

export interface FeatureCard {
  /* the final art carries the headline - card title renders sr-only */
  titleInImage?: boolean;
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
    image: '/bondok/home/banner-bucket.webp',
    mobileImage: '/bondok/home/banner-bucket-mobile.webp',
    full: true,
    card: '/bondok/hero-12pcs.webp',
    alt: '12 Pcs Meal',
    href: '/menu/meals/12-pcs-meal',
  },
  {
    title: 'NEW Shrimp Roll',
    text: 'Crunchy shrimp, bold sauce, soft roll. Try it today.',
    cta: 'Order Now',
    image: '/bondok/home/banner-shrimp-roll.webp',
    mobileImage: '/bondok/home/banner-shrimp-roll-mobile.webp',
    full: true,
    card: '/bondok/hero-shrimp-roll.webp',
    alt: 'Shrimp Roll',
    href: '/menu/rolls/shrimp-roll',
  },
  {
    title: '12 Tenders Feast',
    text: 'Crispy tenders stacked high - dip into every flavor.',
    cta: 'Order Now',
    image: '/bondok/home/banner-tenders-feast.webp',
    mobileImage: '/bondok/home/banner-tenders-feast-mobile.webp',
    full: true,
    card: '/bondok/hero-tenders.webp',
    alt: '12 Pcs Tenders',
    href: '/menu/kids-tenders/12-pcs-tenders',
  },
];

export const favorites: FavoriteItem[] = [
  { title: 'Bondok Meal', image: '/bondok/home/fav-bondok-meal.webp', alt: 'Bondok Meal', href: '/menu/meals/bondok-meal' },
  { title: '12 Pcs Tenders', image: '/bondok/home/fav-12-tenders.webp', alt: '12 Pcs Tenders', href: '/menu/kids-tenders/12-pcs-tenders' },
  { title: 'Shrimp Roll', image: '/bondok/home/fav-shrimp-roll.webp', alt: 'Shrimp Roll', href: '/menu/rolls/shrimp-roll' },
  { title: 'Cheezy Jalapeno Fries', image: '/bondok/home/fav-cheese-fries.webp', alt: 'Cheezy Jalapeno Fries', href: '/menu/sides/cheese-fries' },
  { title: 'Texas & Beef Burger', image: '/bondok/home/fav-texas-burger.webp', alt: 'Texas and Beef Burger', href: '/menu/burgers/texas-and-beef-burger' },
  { title: 'Chicken Cheddar Jalapeno', image: '/bondok/home/fav-cheddar.webp', alt: 'Chicken Cheddar Jalapeno', href: '/menu/sandwiches/chicken-cheddar-jalapeno' },
  { title: 'Chicken Mozzarella', image: '/bondok/home/fav-mozzarella.webp', alt: 'Chicken Mozzarella', href: '/menu/sandwiches/chicken-mozzarella' },
  { title: 'Grilled Chicken', image: '/bondok/home/fav-grilled-chicken.webp', alt: 'Grilled Chicken', href: '/menu/grilled/grilled-chicken' },
];

/* titleInImage: the final art already carries the headline - the card
   renders its title for screen readers only */
export const featureCards: FeatureCard[] = [
  {
    title: 'Big Flavour Wrap',
    text: 'Crispy chicken fillet wrapped tight with our signature sauces. Grab yours today.',
    cta: 'Order Now',
    image: '/bondok/home/feature-wrap.webp',
    titleInImage: true,
    alt: 'Chicken Fillet Roll',
    href: '/menu',
  },
  {
    title: 'Meals Made for Sharing',
    text: '12, 16, or 20 pieces of golden fried chicken with sides for the whole table.',
    cta: 'Order Now',
    image: '/bondok/home/feature-family.webp',
    titleInImage: true,
    alt: '16 Pcs Family Meal',
    href: '/menu',
  },
  {
    title: 'Little Bondok Meals',
    text: 'Kid-sized favorites with nuggets, fillet, or fried chicken. Smiles included.',
    cta: 'Order Now',
    image: '/bondok/home/feature-kids.webp',
    titleInImage: true,
    alt: 'Kids Meal',
    href: '/menu',
  },
  {
    title: 'Sides & Sauces',
    text: 'Cheese fries, mozzarella sticks, onion rings, and our famous sauce lineup.',
    cta: 'See the Menu',
    image: '/bondok/home/feature-sides.webp',
    titleInImage: true,
    alt: 'Cheese Fries',
    href: '/menu',
  },
];

export const footerLinks: { label: string; href: string }[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Offers', href: '/offers' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Our Branches', href: '/branches' },
  { label: 'Catering', href: '/catering' },
  { label: 'Rewards', href: '/rewards' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Delivery Terms', href: '/delivery-terms' },
  { label: 'Offer Terms', href: '/offer-terms' },
  { label: 'Contact Us', href: '/complaints' },
];
