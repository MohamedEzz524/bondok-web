/* Legal & info page contents. Demo copy written for the Bondok build — clear,
   customer-friendly boilerplate the client can adjust or have legally reviewed
   before launch. One place; every legal page/modal renders from here. */

export interface LegalSection {
  heading?: string;
  body: string;
}

export interface LegalDoc {
  title: string;
  updated?: string;          // shown as "Last updated …"
  sections: LegalSection[];
  pending: boolean;          // true shows a "draft" banner; false = published copy
}

const UPDATED = 'September 2026';

export const legalDocs: Record<string, LegalDoc> = {
  terms: {
    title: 'Terms of Service',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Welcome to Bondok. By browsing our website, creating an account, or placing an order, you agree to these Terms of Service. Please read them carefully.' },
      { heading: 'Ordering & prices', body: 'All prices are shown in Egyptian Pounds (EGP) and may vary by branch. Menu items, prices, and availability can change at any time, and some items may sell out. Your order is confirmed once you complete checkout; if an item becomes unavailable after you order, we will contact you to adjust the order or arrange a refund for that item.' },
      { heading: 'Payment', body: 'You can pay by cash on delivery, and by card once card payments are enabled at your branch. By placing an order you confirm you are authorised to use the chosen payment method and that the details you provide are accurate.' },
      { heading: 'Changes & cancellations', body: 'If you need to change or cancel an order, contact your selected branch as soon as possible. Once preparation has started we may not be able to cancel. We reserve the right to refuse or cancel an order in cases of suspected fraud, incorrect pricing, or delivery outside a branch’s coverage area.' },
      { heading: 'Your account', body: 'Accounts are secured with your phone number and a one-time code (OTP). Keep your code private — you are responsible for orders placed through your account. Let us know immediately if you believe your account has been used without permission.' },
      { heading: 'Rewards & offers', body: 'Bondok Rewards points and promotional offers are governed by our Offer Terms. Points and offers have no cash value and may be changed or withdrawn.' },
      { heading: 'Content & liability', body: 'The Bondok name, logo, menu, images, and site content belong to Bondok and are provided for your personal use in ordering. Product images are illustrative and actual items may vary. To the extent permitted by law, Bondok is not liable for indirect or incidental losses arising from use of the site.' },
      { heading: 'Governing law & contact', body: 'These terms are governed by the laws of the Arab Republic of Egypt. Questions? Reach us through the Contact Us page or your nearest branch.' },
    ],
  },

  privacy: {
    title: 'Privacy Policy',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Your privacy matters to us. This policy explains what we collect when you use Bondok, why we collect it, and the choices you have.' },
      { heading: 'What we collect', body: 'We collect the details you give us — your name, phone number, and delivery address — along with your order history. If you allow it, we use your device location to find your nearest branch and check whether it delivers to you. We also keep basic usage information to keep the site working and secure.' },
      { heading: 'How we use it', body: 'We use your information to process and deliver your orders, sign you in with a one-time code, provide support, run Bondok Rewards, and improve our menu and service. If you opt in, we may send you offers — you can opt out at any time.' },
      { heading: 'Location', body: 'Location is used only with your permission, and only to recommend the nearest branch and confirm delivery coverage. We do not sell your location or personal data to anyone.' },
      { heading: 'Sharing', body: 'We share the minimum needed to fulfil your order — for example, your address and phone with the branch team and delivery rider. We may use trusted service providers under confidentiality agreements, and may disclose information where required by law.' },
      { heading: 'Retention & security', body: 'We keep your information only as long as needed to provide our service and meet legal obligations, and we apply reasonable safeguards to protect it.' },
      { heading: 'Your choices', body: 'You can view and update your details from your account, turn off location in your device settings, and unsubscribe from marketing messages. To request access or deletion of your data, contact us through the Contact Us page.' },
    ],
  },

  'delivery-terms': {
    title: 'Delivery Terms',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Bondok delivers from the branch nearest to you. Delivery details depend on your selected branch and address.' },
      { heading: 'Coverage areas', body: 'Each branch delivers within its own coverage area. Enter your address or share your location at checkout to confirm your branch can reach you. If you are outside all delivery areas, you can still order for pickup from any branch.' },
      { heading: 'Fees & minimums', body: 'The delivery fee for your order is shown at checkout in EGP and may vary by branch and distance. Delivery is free when your order reaches the free-delivery threshold shown in your cart. A minimum order value may apply in some areas.' },
      { heading: 'Delivery times', body: 'Estimated delivery times are shown when you order and are approximate. Actual times can vary with demand, traffic, and weather. We always aim to get your food to you hot and fresh as quickly as possible.' },
      { heading: 'Order accuracy & issues', body: 'Please review your items, address, and phone number before confirming. If anything is wrong with your order, contact your branch and we will make it right.' },
      { heading: 'Pickup', body: 'Prefer to collect? Choose “Pick Up”, select your branch, and we will let you know when your order is ready.' },
    ],
  },

  'offer-terms': {
    title: 'Offer Terms',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'These terms apply to Bondok promotions, promo codes, free gifts, and Bondok Rewards. Specific offers may carry their own additional conditions.' },
      { heading: 'General', body: 'Offers are available for a limited time, while stocks last, and at participating branches only. Unless stated otherwise, offers cannot be combined with other promotions, and prices/availability may vary by branch.' },
      { heading: 'Promo codes', body: 'One promo code may be applied per order unless otherwise stated. Codes may require a minimum spend, may be limited to certain items or branches, and can be withdrawn or changed at any time.' },
      { heading: 'Free gifts', body: 'When your order qualifies (for example, by reaching a spend threshold), a free item is added automatically. Free gifts are limited to one per qualifying order and are subject to availability.' },
      { heading: 'Bondok Rewards points', body: 'You earn points on eligible spend and can redeem them at checkout for a discount. Points have no cash value, are non-transferable, may expire, and can be adjusted if an order is cancelled or refunded.' },
      { heading: 'Changes', body: 'Bondok may modify, pause, or end any offer at any time. Where an offer and these terms conflict, the specific offer’s terms apply.' },
    ],
  },

  'nutritional-information': {
    title: 'Nutrition & Allergen Information',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'We want you to enjoy Bondok with confidence. This page explains how to get nutrition and allergen details for our menu.' },
      { heading: 'Nutrition values', body: 'Nutrition values are based on standard recipes and are approximate. Because our food is freshly prepared to order, actual values can vary slightly between branches and servings. Per-item values for the full menu are available on request at any branch.' },
      { heading: 'Allergens', body: 'Our dishes may contain or come into contact with common allergens including gluten (wheat), dairy, egg, soy, sesame, and mustard. Fried items share cooking oil and equipment, so we cannot guarantee any item is completely free from a given allergen.' },
      { heading: 'If you have an allergy', body: 'Please tell our team about any allergy when you order so we can share the best available information and take reasonable care. If you have a severe allergy, we recommend caution as cross-contact can occur in a busy kitchen.' },
      { heading: 'Freshness', body: 'Everything is cooked fresh using signature Bondok ingredients. Product photos are for illustration; your actual dish may look a little different.' },
    ],
  },

  careers: {
    title: "We're Hiring",
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Bondok is growing across Egypt, and we’re always looking for friendly, energetic people who love great food and great service.' },
      { heading: 'Roles we hire for', body: 'Kitchen crew and cooks, front-of-house and cashiers, delivery riders, shift leaders, and branch management. Full-time and part-time roles are available across our branches.' },
      { heading: 'What we offer', body: 'On-the-job training, real opportunities to grow into senior and management roles, staff meals, and a supportive team that feels like family.' },
      { heading: 'How to apply', body: 'Send us your details through the Contact Us page — tell us the role and branch you’re interested in — or drop by any Bondok branch and speak to the manager. We review applications on a rolling basis and will reach out if there’s a fit.' },
      { heading: 'Equal opportunity', body: 'Bondok is an equal-opportunity employer. We welcome applicants of all backgrounds and hire based on talent and attitude.' },
    ],
  },

  franchise: {
    title: 'Open A Bondok',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Love Bondok and want to bring it to your city? We’re selectively expanding through franchise partners who share our passion for quality and hospitality.' },
      { heading: 'What we look for', body: 'Partners with the capital to invest, a strong proposed location, operational commitment, and genuine enthusiasm for the food-and-beverage business.' },
      { heading: 'What you get', body: 'The Bondok brand and recipes, full setup and staff training, supply-chain support, marketing, and ongoing operational guidance so your branch launches and runs well.' },
      { heading: 'How it works', body: 'Submit your interest with your city and proposed location, and our team will review it, meet with you to discuss the opportunity, and guide you through the agreement and opening steps.' },
      { heading: 'Get in touch', body: 'Start the conversation through our Contact Us page and mention “Franchise” along with your city — we’ll take it from there.' },
    ],
  },

  catering: {
    title: 'Catering',
    updated: UPDATED,
    pending: false,
    sections: [
      { body: 'Feeding a crowd? Let Bondok handle the food. From family gatherings to office lunches and events, we cater it crispy, hot, and fresh.' },
      { heading: 'What we offer', body: 'Sharing buckets and family boxes, platters of our signature sandwiches and burgers, loaded sides, and sauce selections — scaled to your headcount.' },
      { heading: 'Ordering ahead', body: 'For larger orders we recommend ordering at least a day in advance so your nearest branch can prepare everything on time. Exact lead times and package pricing vary by branch.' },
      { heading: 'How to book', body: 'Choose your nearest branch and reach out via the Contact Us page or the branch hotline with your date, headcount, and any preferences, and we’ll build the right spread for you.' },
    ],
  },
};
