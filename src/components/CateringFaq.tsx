'use client';

/* Catering FAQ accordion - draft answers, final content pending client. */

import { useState } from 'react';

const FAQS = [
  { q: 'How far in advance should I place a catering order?', a: 'Ordering a day ahead is recommended for large trays. Exact lead times per branch are being finalized and will be listed here.' },
  { q: 'Is there a minimum order for catering?', a: 'Minimums are being set per branch and will be published here.' },
  { q: 'How many people does a tray serve?', a: 'Serving guides per tray size will be listed with the catering menu.' },
  { q: 'Do all branches accept catering orders?', a: 'Catering availability per branch is being confirmed - the Branches page will show which locations offer it.' },
];

export default function CateringFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list cat-faq-list">
      {FAQS.map((f, i) => (
        <div key={i} className={`faq-item${open === i ? ' is-open' : ''}`}>
          <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {f.q}
            <svg className="faq-chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {open === i && <p className="faq-a">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
