/* Reviews page data.
   SAMPLE DATA shaped to the approved design - real reviews arrive from the
   client's Google Business Profile connection (backend phase); video files
   and community photos come from the client. */

export interface ReviewSummary {
  score: number;
  outOf: number;
  total: number;
  /* 5 -> 1 stars, percentages */
  histogram: number[];
  blurb: string;
  audience: string;
}

export interface FeaturedReview {
  initials: string;
  name: string;
  branch: string;
  when: string;
  text: string;
  chips: string[];
}

export interface GridReview {
  initials: string;
  name: string;
  stars: number;
  branch: string;
  when: string;
  text: string;
  tag: string;
  helpful: number;
}

export const summary: ReviewSummary = {
  score: 4.8,
  outOf: 5.0,
  total: 1248,
  histogram: [85, 10, 3, 1, 1],
  blurb: 'Based on 1,248+ happy customers',
  audience: 'Loved by food lovers across Cairo, Giza & Alexandria',
};

export const featured: FeaturedReview[] = [
  {
    initials: 'AM',
    name: 'Ahmed M.',
    branch: 'Nasr City',
    when: '2 days ago',
    text: '"Honestly one of the best chicken fillet sandwiches I\'ve had. The chicken was crispy, juicy and full of flavor!"',
    chips: ['Ordered: Chicken Fillet', 'Crunch: 10/10 · Spice: Perfect'],
  },
  {
    initials: 'SK',
    name: 'Sarah K.',
    branch: 'New Cairo',
    when: '4 days ago',
    text: '"The fries were amazing and the combo was perfect. Secret dipping sauce is out of this world. Definitely ordering again!"',
    chips: ['Ordered: Tenders Combo', 'Dipping: Cheese Sauce'],
  },
  {
    initials: 'MA',
    name: 'Mohamed A.',
    branch: 'Maadi Delivery',
    when: '1 week ago',
    text: '"Fast delivery, great packaging and the food arrived hot. Kept in the insulated bag perfectly. Exactly what I wanted!"',
    chips: ['Ordered: Texas & Beef Burger', 'Hot Bag: Yes'],
  },
];

export const gridReviews: GridReview[] = [
  {
    initials: 'LH',
    name: 'Layla H.',
    stars: 5,
    branch: 'Zamalek',
    when: 'Yesterday',
    text: '"The Chicken Chili Fire is seriously addictive. Perfect spice level, hot honey drizzle on point! We ordered for our whole design team and everyone loved it."',
    tag: 'Chili Fire · Hot Honey',
    helpful: 14,
  },
  {
    initials: 'KE',
    name: 'Karim E.',
    stars: 5,
    branch: 'Heliopolis',
    when: '3 days ago',
    text: '"Everything arrived hot and fresh. The packaging was really good too - the kraft box kept the crinkle fries crispy, which almost no one gets right in delivery."',
    tag: 'Delivery Packaging',
    helpful: 28,
  },
  {
    initials: 'YN',
    name: 'Youssef N.',
    stars: 5,
    branch: 'October 6th',
    when: '5 days ago',
    text: '"Food was great! Delivery took a little longer than expected during dinner rush, but the burger made up for it. The crust is unmatched."',
    tag: 'Texas & Beef Burger',
    helpful: 9,
  },
  {
    initials: 'NG',
    name: 'Nour G.',
    stars: 5,
    branch: 'Mohandessin',
    when: '6 days ago',
    text: '"The mushroom burger was amazing. Rich caramelized onions and gooey swiss cheese. Will definitely come back to dine in."',
    tag: 'Mushroom Burger',
    helpful: 33,
  },
  {
    initials: 'TB',
    name: 'Tarek B.',
    stars: 5,
    branch: 'New Cairo',
    when: '1 week ago',
    text: '"Best crinkle fries I\'ve had in a long time! Make sure to order the Cheezy Jalapeno and BBQ dips. That combo is unreal."',
    tag: 'Cheese Fries · Dips',
    helpful: 19,
  },
  {
    initials: 'SR',
    name: 'Salma R.',
    stars: 5,
    branch: 'Nasr City',
    when: '2 weeks ago',
    text: '"Dine-in vibe was immaculate. Music, neon lights, and the self-pickup lockers work like magic. Fast casual food with luxury care."',
    tag: 'Store Atmosphere',
    helpful: 42,
  },
];
