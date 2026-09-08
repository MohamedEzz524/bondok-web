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
  daysAgo: number;   // sortable age for "Most Recent"
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
    daysAgo: 1,
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
    daysAgo: 3,
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
    daysAgo: 5,
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
    daysAgo: 6,
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
    daysAgo: 7,
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
    daysAgo: 14,
    text: '"Dine-in vibe was immaculate. Music, neon lights, and the self-pickup lockers work like magic. Fast casual food with luxury care."',
    tag: 'Store Atmosphere',
    helpful: 42,
  },
  {
    initials: 'HA',
    name: 'Hana A.',
    stars: 5,
    branch: 'Maadi',
    when: '2 days ago',
    daysAgo: 2,
    text: '"Ordered the 16 pcs family meal for a movie night. Everything was crunchy, the coleslaw was fresh, and the sauces selection is generous."',
    tag: '16 Pcs Family Meal',
    helpful: 21,
  },
  {
    initials: 'OS',
    name: 'Omar S.',
    stars: 4,
    branch: 'October 6th',
    when: '4 days ago',
    daysAgo: 4,
    text: '"Great taste and juicy chicken. Took one star off because my drink arrived without ice, but the branch handled it kindly on the next order."',
    tag: 'Classic Meal',
    helpful: 12,
  },
  {
    initials: 'MF',
    name: 'Mariam F.',
    stars: 5,
    branch: 'Zamalek',
    when: '1 week ago',
    daysAgo: 8,
    text: '"The shrimp roll surprised me - crunchy shrimp with a sauce that actually has a kick. My new regular order."',
    tag: 'Shrimp Roll',
    helpful: 17,
  },
  {
    initials: 'KH',
    name: 'Khaled H.',
    stars: 4,
    branch: 'Heliopolis',
    when: '1 week ago',
    daysAgo: 9,
    text: '"Solid tenders and great dips. Delivery was a bit slow on a Friday night, but the food arrived hot in the insulated bag."',
    tag: '12 Pcs Tenders',
    helpful: 8,
  },
  {
    initials: 'DN',
    name: 'Dina N.',
    stars: 5,
    branch: 'Nasr City',
    when: '2 weeks ago',
    daysAgo: 15,
    text: '"Kids meal made our kids so happy - the box, the toy vibe, the nuggets. Parent-approved portion sizes too."',
    tag: 'Kids Meal',
    helpful: 26,
  },
  {
    initials: 'AB',
    name: 'Aly B.',
    stars: 4,
    branch: 'Mohandessin',
    when: '2 weeks ago',
    daysAgo: 16,
    text: '"The mushroom burger is rich and messy in the best way. Wish the fries portion was slightly bigger for the combo price."',
    tag: 'Mushroom Burger',
    helpful: 6,
  },
  {
    initials: 'RM',
    name: 'Rana M.',
    stars: 5,
    branch: 'New Cairo',
    when: '3 weeks ago',
    daysAgo: 21,
    text: '"Cheese fries with the jalapeno sauce is criminal. Ordered twice in one week and both times arrived crispy."',
    tag: 'Cheese Fries',
    helpful: 31,
  },
  {
    initials: 'WT',
    name: 'Walid T.',
    stars: 5,
    branch: 'Maadi',
    when: '3 weeks ago',
    daysAgo: 23,
    text: '"Best fried chicken crust in the area, hands down. You can hear the crunch. The bucket survived a 25-minute drive still hot."',
    tag: '12 Pcs Bucket',
    helpful: 38,
  },
  {
    initials: 'SF',
    name: 'Salma F.',
    stars: 4,
    branch: 'Zamalek',
    when: '1 month ago',
    daysAgo: 30,
    text: '"Lovely dine-in experience and friendly crew. The spicy fillet could be spicier for my taste - hence four stars."',
    tag: 'Chicken Fillet',
    helpful: 11,
  },
];
