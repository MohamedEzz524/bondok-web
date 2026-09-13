'use client';

/* Compact product-reviews carousel shown below the PDP add-to-cart. Sample data
   until real reviews arrive. The top-row rating scrolls here via #pd-reviews. */

import { useState } from 'react';

const REVIEWS = [
  { name: 'Ahmed M.', rating: 4.8, title: 'Absolutely delicious!', text: 'Crispy outside, juicy inside — easily the best fried chicken in ages, and generous portions.' },
  { name: 'Sara K.', rating: 5, title: 'Family favourite', text: 'Ordered for the whole family and everyone loved it. Arrived hot and fresh, sauces spot on.' },
  { name: 'Omar T.', rating: 4.5, title: 'Great value', text: 'Big meal, fair price, and the flavour is consistent every time. Highly recommend the combo.' },
  { name: 'Nour A.', rating: 5, title: 'My go-to order', text: 'Crunchy coating, tenders never dry, and fast delivery. I keep coming back for this one.' },
];

const Star = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="m12 17.3-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z" /></svg>
);

export default function ProductReviews() {
  const [i, setI] = useState(0);
  const r = REVIEWS[i];
  const prev = () => setI((x) => (x - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setI((x) => (x + 1) % REVIEWS.length);

  return (
    <section id="pd-reviews" className="pd-reviews" aria-label="Customer reviews">
      <div className="pd-reviews-head">
        <span className="pd-reviews-who">
          <strong>{r.name}</strong>
          <span className="pd-reviews-rate">{r.rating}<span className="pd-reviews-star"><Star /></span></span>
        </span>
        <span className="pd-reviews-chat" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
        </span>
      </div>

      <p className="pd-reviews-title">{r.title}</p>
      <p className="pd-reviews-text">{r.text}</p>

      <div className="pd-reviews-foot">
        <button type="button" className="pd-reviews-nav" onClick={prev} aria-label="Previous review">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="pd-reviews-dots" aria-hidden="true">
          {REVIEWS.map((_, d) => <span key={d} className={d === i ? 'is-on' : ''} />)}
        </div>
        <button type="button" className="pd-reviews-nav pd-reviews-nav-next" onClick={next} aria-label="Next review">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </section>
  );
}
