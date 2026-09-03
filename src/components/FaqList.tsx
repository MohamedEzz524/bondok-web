'use client';

/* FAQ accordion - structural placeholder. Questions/answers are drafts;
   the client's approved FAQ content replaces this list. */

import { useState } from 'react';

const FAQS: { q: string; a: string }[] = [
  { q: 'What areas do you deliver to?', a: 'Each branch covers its nearby areas. Delivery coverage per branch will be listed here and checked automatically at checkout.' },
  { q: 'How long does delivery take?', a: 'Estimated delivery times depend on your branch and area, and will show at checkout once branch data is connected.' },
  { q: 'What payment methods do you accept?', a: 'Cash on delivery is available. Card and wallet payments are coming with our online payment launch.' },
  { q: 'Can I order for pickup?', a: 'Yes - choose Pick Up at the top of the menu, select your branch, and your order will be ready when you arrive.' },
  { q: 'Do you cater events?', a: 'Yes. See our Catering page for packages and how to order ahead for your event.' },
  { q: 'Where can I find nutrition and allergen information?', a: 'A full nutrition and allergen guide is being prepared and will be published on its own page.' },
];

export default function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-page">
      <div className="menu-head">
        <h1>FAQs</h1>
        <p>Quick answers to the questions we hear most.</p>
      </div>
      <div className="branches-note">
        Draft questions &amp; answers - final FAQ content is pending client review.
      </div>
      <div className="faq-list">
        {FAQS.map((f, i) => (
          <div key={i} className={`faq-item${open === i ? ' is-open' : ''}`}>
            <button
              className="faq-q"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {f.q}
              <svg className="faq-chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {open === i && <p className="faq-a">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
