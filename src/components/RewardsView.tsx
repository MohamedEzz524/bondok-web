'use client';

/* Bondok Rewards - cloned from the real reference rewards experience
   (campaign.popeyes.com/rewards, embedded on popeyes.com/rewards):
   tab strip -> orange hero -> free-treat picker -> sticky "points" section
   with reward cards scrolling past -> getting-started steps -> FAQ with
   category pills. All program values are placeholders until the loyalty
   program (future phase) is defined with the client. */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.45, ease: 'easeOut' as const },
};

/* coin doodle positions mirror the reference hero's top band */
const FLOATERS = [
  { left: '-2%', top: '4%', size: 110, delay: 0 },
  { left: '13%', top: '2%', size: 72, delay: 0.8 },
  { left: '24%', top: '5%', size: 56, delay: 1.6 },
  { left: '31%', top: '12%', size: 76, delay: 0.4 },
  { left: '46%', top: '5%', size: 82, delay: 1.2 },
];

const TREATS = [
  { img: '/bondok/menu/sides/french-fries.webp', name: 'French Fries' },
  { img: '/bondok/menu/sides/coleslaw.webp', name: 'Coleslaw' },
  { img: '/bondok/menu/sides/bbq-sauce.webp', name: 'BBQ Sauce' },
];

/* sample points values - real ones come with the loyalty program */
const REWARD_CARDS = [
  { img: '/bondok/menu/sides/cheese-fries.webp', name: 'Cheese Fries', points: 300 },
  { img: '/bondok/menu/kids-tenders/4-pcs-tenders.webp', name: '4 Pcs Tenders', points: 300 },
  { img: '/bondok/fav-chicken-fillet.webp', name: 'Chicken Fillet Sandwich', points: 600 },
  { img: '/bondok/menu/meals/classic-meal.webp', name: 'Classic Meal', points: 900 },
  { img: '/bondok/menu/meals/bondok-meal.webp', name: 'Bondok Meal', points: 1200 },
];

const STEP_CARDS = [
  { n: 1, t: 'Join Rewards', d: 'Sign up with just your phone number - no passwords, no forms.' },
  { n: 2, t: 'Earn Points', d: 'Here is the deal: every EGP you spend adds points to your balance.' },
  { n: 3, t: 'Redeem FREE Food', d: 'Snag your first rewards just by signing up and keep earning for more.' },
];

const FAQ_CATS: Record<string, { q: string; a: string }[]> = {
  General: [
    { q: 'What is Bondok Rewards?', a: 'Our loyalty program - earn points on every order and swap them for free food. Full details arrive at launch.' },
    { q: 'How do I join?', a: 'Sign up with your phone number when the program launches - it takes seconds.' },
    { q: 'Does joining cost anything?', a: 'No - joining Bondok Rewards is completely free.' },
  ],
  Earning: [
    { q: 'How do I earn points?', a: 'Every EGP you spend on orders earns points automatically. Exact rates are announced at launch.' },
    { q: 'Do points expire?', a: 'Point expiry rules will be published with the program terms.' },
  ],
  'Point Balances': [
    { q: 'Where can I see my points?', a: 'Your balance will show in your account once the program launches.' },
    { q: 'My points look wrong - what do I do?', a: 'Reach out through Complaints & Suggestions and our team will check your account.' },
  ],
  Redemptions: [
    { q: 'How can I redeem rewards?', a: 'Swap points for freebies right from the rewards page when you order.' },
    { q: 'Can redemptions be combined with other discounts?', a: 'Combination rules will be part of the program terms at launch.' },
  ],
};

function CoinSvg() {
  return (
    <svg viewBox="-4 -4 32 32" fill="currentColor">
      <circle cx="12" cy="12" r="14.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M13.6.8c0 .3.4.5.1.7H13c-.4 0-1.1.4-1.2.9 0 .3.7.7.2.8-.5 0-.9-.6-1.1 0l-.4.6-.1.7-.8.3-.2.8q-.1 1-.8 1.6-.3.1-.5.4 0 .4.3.6l-.2.4-.4.2q-.2.2-.3.8l-.2.8q.1.3.4.5c.1.7-.7.8-.9 1.3q0 .3.3.4h.5q.3 0 .4.3l-.2.4-.4.6v.7l.2.3q0 .3-.3.5L6 17c-.3.3-.6 1-1.1.8l-1.2-.4q-.7 0-1.2.6v1q.1 1.1.7 2l.2.4.1.2-.1.8.1.6q.4.8 1.2 1 1.7.2 2.2-1.2.2-.6 0-1.1t0-.9l1.4-2.4s.4-.7.3-.9q-.5 0-.9.5l-.9 1.2-.8 1.1c-.8-.6-1.3 0-2 .5a3 3 0 0 1-.4-2q0-.5.6-.4l.6.4q.5 0 .6-.4l1-.8 1-1L8 16q.1-.4.4-.6 0-.2.3 0l.1.5c0 .7.2 1.6 1 1.4.4 0 .6-.4.9-.4.4-.2.5-.1.8-.6q0-.5.6-.7.4.2.6 0l.3.1.3.4q.4 0 .6-.2l.6-.4.2-.5c.5-1.1 2-.2 2.5-1l.5-.5q.4-.2.4-.5c.1-.5.2 0 .5-.2v-.3h.3l.5-.6q.2-.3.8-.5.3 0 .2-.6l-.5-.2q-.2 0 0-.2t.2-.7v-.2q.4 0 .5-.4h.1q.2 0 .3-.2l-.2-.5q-.1-.4.2-.5t.5-.3c.2-.4-.3-.6-.5-.7l-.5-.6.1-.4.5-.6q-.1-.5-.4-.8c-.3-.3.5-.6.4-.9q-.2-.4-.8-.4l-.3-.4-.5-.4-1-.5q0-.3-.3-.3l-.3-.3V.7l-.2-.2h-1l-.3-.5q-.4 0-.6.2l-.4.5q-.4.1-.6-.2c-.3 0-1.2 0-1.2.3" />
    </svg>
  );
}

/* small inline coin for chips */
function MiniCoin() {
  return (
    <svg viewBox="-4 -4 32 32" width="16" height="16" fill="var(--orange)" aria-hidden="true">
      <circle cx="12" cy="12" r="14.5" fill="none" stroke="var(--orange)" strokeWidth="3" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}

function Sparkle({ style }: { style: React.CSSProperties }) {
  return (
    <svg className="rw2-spark" style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1c1 5 3 8 11 11-8 3-10 6-11 11-1-5-3-8-11-11 8-3 10-6 11-11z" />
    </svg>
  );
}

/* hand-drawn "Free" sticker like the reference reward cards */
function FreeSticker() {
  return (
    <svg className="rw2-free" viewBox="0 0 56 32" aria-hidden="true">
      <ellipse cx="28" cy="16" rx="26" ry="13" fill="none" stroke="#01847e" strokeWidth="1.8" />
      <text x="28" y="21" textAnchor="middle" fontFamily="cursive" fontStyle="italic" fontSize="14" fill="#01847e">Free</text>
      <path d="M50 4l3-2M52 8l4-1M4 26l-3 2" stroke="#01847e" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function RewardsView() {
  const reduced = useReducedMotion();
  const [faqCat, setFaqCat] = useState('General');
  const [openQ, setOpenQ] = useState<number | null>(null);

  return (
    <div className="rewards-page">
      {/* anchor tab strip (reference pattern) */}
      <nav className="subnav rewards-subnav" aria-label="Rewards sections">
        <a href="#freebies">Freebies</a>
        <a href="#earn">Rewards</a>
        <a href="#how">How It Works</a>
        <a href="#rewards-faq">FAQ</a>
      </nav>

      {/* orange hero with floating coins */}
      <section className="rw-hero">
        {FLOATERS.map((f, i) => (
          <motion.span
            key={i}
            className="rw-coin"
            style={{ left: f.left, top: f.top, width: f.size, height: f.size }}
            animate={reduced ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <CoinSvg />
          </motion.span>
        ))}
        <motion.div className="rw-hero-media" {...fadeUp} transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bondok/hero-12pcs.webp" alt="Bondok bucket meal" />
        </motion.div>
        <div className="rw-hero-inner">
          <motion.div className="rw-hero-copy" {...fadeUp}>
            <div className="drawer-brand rw-brand">
              <span className="drawer-brand-top">Bondok</span>
              <span className="drawer-brand-rewards">Rewards</span>
            </div>
            <h1>More of the chicken you love, for FREE</h1>
            <p className="rw-points">Earn points with every EGP you spend</p>
            <button className="btn rw-signup">Sign Up</button>
            <span className="rw-fine">Program details are being finalized - points values and freebies announced at launch.</span>
          </motion.div>
        </div>
      </section>

      {/* free welcome treat (reference: "Feeling the love? Us too!") */}
      <section id="freebies" className="rw2-treat">
        <motion.div {...fadeUp}>
          <h2>
            Feeling the love? Us too!<br />
            <span className="rw2-teal">FREE</span> treat on us now
          </h2>
          <p className="rw2-treat-min">with a minimum purchase</p>
        </motion.div>
        {TREATS.map((t, i) => (
          <motion.div key={t.name} className="rw2-treat-item" {...fadeUp}>
            <Sparkle style={i % 2 ? { right: '8%', top: 12, width: 30 } : { left: '8%', top: 12, width: 38 }} />
            <Sparkle style={i % 2 ? { left: '14%', bottom: 40, width: 20 } : { right: '12%', bottom: 40, width: 22 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.img} alt={t.name} loading="lazy" />
            <h3>{t.name}</h3>
            <span className="rw2-chip">FREE <MiniCoin /></span>
          </motion.div>
        ))}
        <motion.button className="btn btn-solid rw2-treat-cta" {...fadeUp}>Free Reward!</motion.button>
      </section>

      {/* sticky points section with reward cards scrolling past */}
      <section id="earn" className="rw2-earn">
        <div className="rw2-earn-inner">
          <div className="rw2-earn-left">
            <p className="rw2-earn-eq">EGP 1 = <MiniCoinWhite /> 10 points</p>
            <h2>Dig in and let the rewards roll in!</h2>
            <Sparkle style={{ right: '4%', top: -18, width: 34, color: '#fff' }} />
            <Sparkle style={{ left: '-8%', bottom: -30, width: 24, color: '#fff' }} />
          </div>
          <div className="rw2-cards">
            {REWARD_CARDS.map((c) => (
              <motion.article key={c.name} className="rw2-card" {...fadeUp} viewport={{ once: true, amount: 0.5 }}>
                <div className="rw2-card-img">
                  <FreeSticker />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.img} alt={c.name} loading="lazy" />
                </div>
                <div className="rw2-card-body">
                  <span className="rw2-chip">{c.points} <MiniCoin /></span>
                  <h3>{c.name}</h3>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* getting started */}
      <section id="how" className="rw2-steps">
        <motion.h2 {...fadeUp}>Getting started is as easy as pie!</motion.h2>
        <div className="rw2-steps-row">
          {STEP_CARDS.map((s) => (
            <motion.div key={s.n} className="rw2-step-card" {...fadeUp}>
              <span className="rw2-step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="rw2-coinband" aria-hidden="true" />
      </section>

      {/* FAQ with category pills */}
      <section id="rewards-faq" className="rw2-faq">
        <motion.h2 {...fadeUp}>FAQs</motion.h2>
        <div className="rw2-faq-tabs" role="tablist" aria-label="FAQ categories">
          {Object.keys(FAQ_CATS).map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={faqCat === cat}
              className={`rw2-faq-tab${faqCat === cat ? ' is-active' : ''}`}
              onClick={() => { setFaqCat(cat); setOpenQ(null); }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="rw2-faq-list">
          {FAQ_CATS[faqCat].map((f, i) => (
            <div key={f.q} className={`faq-item${openQ === i ? ' is-open' : ''}`}>
              <button className="faq-q" aria-expanded={openQ === i} onClick={() => setOpenQ(openQ === i ? null : i)}>
                {f.q}
                <svg className="faq-chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openQ === i && <p className="faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
        <button className="btn btn-solid rw2-faq-cta">Start Earnin&apos;</button>
        <p className="rw2-disclaimer">
          Disclaimer: The Bondok Rewards program details shown here are placeholders. Points values,
          freebies, and terms are announced when the loyalty program launches.
        </p>
        <div className="rw2-coinband" aria-hidden="true" />
      </section>
    </div>
  );
}

function MiniCoinWhite() {
  return (
    <svg viewBox="-4 -4 32 32" width="20" height="20" fill="#ffe6a8" aria-hidden="true" style={{ verticalAlign: '-3px' }}>
      <circle cx="12" cy="12" r="14.5" fill="none" stroke="#ffe6a8" strokeWidth="3" />
      <circle cx="12" cy="12" r="7" />
    </svg>
  );
}
