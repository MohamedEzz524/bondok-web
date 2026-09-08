'use client';

/* Grouped FAQ accordion - shared by the FAQ popup and the /faq page.
   Draft questions written for Bondok; final content pending client review. */

import Link from 'next/link';
import { useState } from 'react';

interface Faq { q: string; a: string; }
interface Group { title: string; items: Faq[]; }

const GROUPS: Group[] = [
  {
    title: 'Ordering & Delivery',
    items: [
      { q: 'What areas do you deliver to?', a: 'Each branch covers its nearby areas. Coverage per branch will be listed here and checked automatically at checkout.' },
      { q: 'How long does delivery take?', a: 'Estimated times depend on your branch and area, and will show at checkout once branch data is connected.' },
      { q: 'What payment methods do you accept?', a: 'Cash on delivery is available. Card and wallet payments are coming with our online payment launch.' },
      { q: 'Can I order for pickup?', a: 'Yes - choose Pick Up at the top of the menu, select your branch, and your order will be ready when you arrive.' },
      { q: 'I have an issue with my order - what do I do?', a: 'Contact your branch directly, or send us the details through the Complaints & Suggestions page and our team will follow up.' },
    ],
  },
  {
    title: 'Our Food',
    items: [
      { q: 'Where can I find nutrition and allergen information?', a: 'A full nutrition and allergen guide is being prepared and will be published on its own page.' },
      { q: 'Do you have meals for kids?', a: 'Yes - check the Kids, Rizo & Tenders section of the menu for kid-sized favorites.' },
      { q: 'Do you cater events?', a: 'Yes. See the Catering page for how to order ahead for gatherings and events.' },
    ],
  },
  {
    title: 'Other',
    items: [
      { q: 'Where is the nearest Bondok branch?', a: 'See the Branches page for all locations, working hours, and contact details.' },
      { q: 'Where can I find the latest offers?', a: 'The Offers page carries all current deals - new campaigns land there first.' },
      { q: 'How can I join the Bondok team?', a: 'Career openings will be posted on the We’re Hiring page. Meanwhile, you can leave your details at any branch.' },
    ],
  },
];

export default function FaqContent() {
  const [open, setOpen] = useState<string | null>('0-0');

  return (
    <div className="faqc">
      <h3 className="faqc-lead">Have questions? We have answers - check the FAQs below.</h3>
      <div className="faqc-cta">
        <p>Looking for your nearest Bondok?</p>
        <Link href="/branches" className="btn btn-solid">Branches &amp; Working Hours</Link>
      </div>
      {GROUPS.map((g, gi) => (
        <section key={g.title} className="faqc-group">
          <h2>{g.title}</h2>
          {g.items.map((f, i) => {
            const id = `${gi}-${i}`;
            const isOpen = open === id;
            return (
              <div key={id} className={`faq-item${isOpen ? ' is-open' : ''}`}>
                <button className="faq-q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : id)}>
                  {f.q}
                  <span className="faq-plus" aria-hidden="true">{isOpen ? '×' : '+'}</span>
                </button>
                <div className={`acc${isOpen ? ' is-open' : ''}`}>
                  <div><p className="faq-a acc-body">{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
