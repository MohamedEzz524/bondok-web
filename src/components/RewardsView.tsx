'use client';

/* Bondok Rewards. The orange hero (first section) is kept from the earlier
   build; everything below follows the new designer layout. All program
   values (points, tiers, the sample account) are placeholders until the
   loyalty program is defined with the client - flagged in the disclaimer. */

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.45, ease: 'easeOut' as const },
};

/* floating Bondok mascots (the designer SVGs) bobbing across the hero -
   the Popeyes-rewards-style animated icon layer */
const FLOATERS = [
  { src: 'Vector-1', left: '1%', top: '7%', size: 150, delay: 0 },
  { src: 'Vector-4', left: '21%', top: '3%', size: 92, delay: 0.6 },
  { src: 'Vector-2', left: '33%', top: '11%', size: 120, delay: 1.2 },
  { src: 'Vector-5', left: '49%', top: '4%', size: 80, delay: 0.4 },
  { src: 'Vector-3', left: '60%', top: '9%', size: 108, delay: 1.6 },
];

/* ---- benefit icons (inline, currentColor) ---- */
const IC = {
  coin: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" /><path fill="currentColor" d="M12 7.2c1.4 0 2.6.5 3.2 1.4l-1.3.9c-.4-.5-1-.8-1.9-.8-1.3 0-2.2.9-2.2 2.3s.9 2.3 2.2 2.3c.9 0 1.5-.3 1.9-.8l1.3.9c-.6.9-1.8 1.4-3.2 1.4-2.2 0-3.9-1.6-3.9-3.9S9.8 7.2 12 7.2z" /></svg>,
  bag: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" d="M5 8h14l-1 12H6zM8.5 8a3.5 3.5 0 0 1 7 0" /></svg>,
  star: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="m12 2 2.9 6.3 6.8.7-5.1 4.6 1.4 6.7L12 17.8 6 20.6l1.4-6.7L2.3 9l6.8-.7z" /></svg>,
  cake: <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" d="M4 20h16v-7H4zM4 13c1.5 0 1.5 1.5 3 1.5S9.5 13 11 13s1.5 1.5 3 1.5S15.5 13 17 13M8 8V6m4 2V6m4 2V6" /><circle cx="8" cy="4.5" r="1" fill="currentColor" /><circle cx="12" cy="4.5" r="1" fill="currentColor" /><circle cx="16" cy="4.5" r="1" fill="currentColor" /></svg>,
};

const BENEFITS = [
  { ic: IC.coin, title: 'Earn Points', text: 'Earn 10 points for every EGP 1 spent across delivery, dine-in, drive-thru, and fast online pickup orders.', tag: 'Automatic Sync' },
  { ic: IC.bag, title: 'Free Food', text: 'Redeem your accumulated points directly in your cart for hot, crispy Bondok chicken, feasts, and loaded sides.', tag: 'Instant Redeem' },
  { ic: IC.star, title: 'Exclusive Offers', text: 'Gain access to member-only news drops, early tasty kitchen items, and surprise double-point days.', tag: 'Secret Drops' },
  { ic: IC.cake, title: 'Birthday Treats', text: 'Celebrate your birthday week with a complimentary signature glazed chicken burger or hand-spun custard shake.', tag: 'Annual Gift' },
];

const EARN_BULLETS = [
  '+50 pts (Sides)', '+100 pts (Beverages & Dips)', '+250 pts (Single Burgers)', '+500 pts (Family Box Deals)',
];

const TIERS = [
  { name: 'Starter', pts: '0 PTS', state: 'done', free: 'Free Signature BBQ Sauce' },
  { name: 'Snack Lover', pts: '300 PTS', state: 'done', free: 'Free Loaded Cheese Fries' },
  { name: 'Chicken Fan', pts: '600 PTS', state: 'current', free: 'Free Crispy Chicken Fillet' },
  { name: 'Bondok Lover', pts: '900 PTS', state: 'locked', free: 'Free Classic Smash Meal' },
  { name: 'Bondok Legend', pts: '1200 PTS', state: 'locked', free: 'Free Full Bondok Grand Feast' },
];

const FIRST = [
  { img: '/bondok/menu/sides/french-fries.webp', title: 'Golden French Fries', text: 'Fresh cut daily, double-fried to crunchy perfection and seasoned with artisan herb salt.' },
  { img: '/bondok/menu/sides/coleslaw.webp', title: 'Signature Coleslaw', text: 'Crisp green cabbage, sweet purple ribbons, and house buttermilk emulsion with gentle citrus tang.' },
  { img: '/bondok/menu/sides/bbq-sauce.webp', title: 'Artisan Sauce Duo', text: 'Choose two chef-crafted dipping sauces including Truffle Mayo, Spicy Honey, or BBQ.' },
];

const HOWSTEPS = [
  { n: '01', t: 'Join Rewards', d: 'Create an account in 30 seconds online or through the Bondok mobile app. We drop your first gift directly into your digital pouch.', link: 'Free Registration' },
  { n: '02', t: 'Earn Points', d: 'Order online, call in, or scan your digital member QR code at any Bondok branch counter. 10 points accumulate per 1 EGP automatically.', link: 'Zero Friction Tracking' },
  { n: '03', t: 'Get Free Food', d: 'Apply points during checkout in 1 tap to discount your order or take home our signature smash burgers and crunchy sides totally free.', link: 'Instant Cart Deduction' },
];

const MENU = [
  { img: '/bondok/menu/sides/cheese-fries.webp', name: 'Cheese Fries', text: 'Crinkle cuts soaked in velvety warm sharp cheddar sauce.', pts: 300, ok: true },
  { img: '/bondok/menu/kids-tenders/4-pcs-tenders.webp', name: '4 Pcs Tenders', text: 'Buttermilk-brined whole chicken breast tenders fried extra crunchy.', pts: 300, ok: true },
  { img: '/bondok/menu/fillet/chicken-fillet.webp', name: 'Chicken Fillet', text: 'Our signature crispy breast fillet, shredded iceberg, and secret spread.', pts: 600, ok: true, popular: true },
  { img: '/bondok/menu/meals/classic-meal.webp', name: 'Classic Meal', text: 'Signature smash burger, regular golden fries, and a fountain drink.', pts: 900, ok: false },
  { img: '/bondok/menu/meals/bondok-meal.webp', name: 'Bondok Feast', text: 'Double meal combo, loaded shareable side, and 2 craft custard cups.', pts: 1200, ok: false },
];

const MENU_FILTERS = ['Sides & Drinks', 'All Entrees'];

const FAQ_CATS: Record<string, { q: string; a: string }[]> = {
  'All Questions': [
    { q: 'What is Bondok Rewards and how do I join?', a: 'Bondok Rewards is our official loyalty program designed to thank our cravings family. Membership is 100% free with no monthly subscription. You can sign up online in under 30 seconds or download the Bondok application to start earning points right away.' },
    { q: 'How do I earn points on delivery vs pickup?', a: 'Points are earned the same way across delivery, pickup, dine-in, and drive-thru - 10 points for every 1 EGP spent. Exact rates are confirmed at launch.' },
    { q: 'How do I redeem my points in the cart?', a: 'Apply your points at checkout in a single tap to discount your order or claim a free reward. Your balance updates instantly.' },
    { q: 'Do my reward points ever expire?', a: 'Point expiry rules will be published with the final program terms at launch.' },
    { q: 'Can I combine reward points with promo discount codes?', a: 'Combination rules with promo codes will be part of the program terms announced at launch.' },
  ],
  'Earning Points': [
    { q: 'How do I earn points on delivery vs pickup?', a: 'Points are earned the same way across every channel - 10 points for every 1 EGP spent.' },
    { q: 'Do my reward points ever expire?', a: 'Point expiry rules will be published with the final program terms.' },
  ],
  Rewards: [
    { q: 'What can I unlock with my points?', a: 'Everything on the rewards menu - from free sides and drinks to full feasts. Values are placeholders until launch.' },
    { q: 'What are milestone tiers?', a: 'As you climb tiers you unlock higher-value free dishes. The exact tiers are being finalized.' },
  ],
  Redemptions: [
    { q: 'How do I redeem my points in the cart?', a: 'Apply points at checkout in one tap to discount your order or claim a free reward.' },
    { q: 'Can I combine reward points with promo discount codes?', a: 'Combination rules will be part of the program terms at launch.' },
  ],
};

export default function RewardsView() {
  const reduced = useReducedMotion();
  const [faqCat, setFaqCat] = useState('All Questions');
  const [openQ, setOpenQ] = useState<number | null>(0);
  const [menuFilter, setMenuFilter] = useState('All Entrees');

  return (
    <div className="rewards-page">
      {/* anchor tab strip */}
      <nav className="subnav rewards-subnav" aria-label="Rewards sections">
        <a href="#why">Why Join</a>
        <a href="#tiers">Tiers</a>
        <a href="#menu">Rewards Menu</a>
        <a href="#rewards-faq">FAQ</a>
      </nav>

      {/* ===== banner hero - the artwork carries all the copy (brand, headline,
           mascots, Sign Up); we only overlay a live hit-area on the Sign Up ===== */}
      <section className="rw-hero">
        {FLOATERS.map((f, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <motion.img
            key={i}
            className="rw-mascot"
            src={`/bondok/rewards/${f.src}.svg`}
            alt=""
            aria-hidden="true"
            style={{ left: f.left, top: f.top, width: f.size }}
            animate={reduced ? undefined : { y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: f.delay, ease: 'easeInOut' }}
          />
        ))}
        <motion.div className="rw-hero-media" {...fadeUp} transition={{ duration: 0.45, ease: 'easeOut' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bondok/rewards-banner.webp" alt="Bondok Rewards - earn points with every EGP you spend and unlock free food" />
          <button type="button" className="rw-signup-hit" aria-label="Sign up for Bondok Rewards" />
        </motion.div>
      </section>

      {/* ===== WHY JOIN ===== */}
      <section id="why" className="rwx-why">
        <motion.header className="rwx-head" {...fadeUp}>
          <p className="rwx-eyebrow">Why Join</p>
          <h2>More Than Just Good Food</h2>
          <p className="rwx-sub">Built for regulars, comfort-food aficionados, and true flavor seekers. Experience privileges designed around how you eat.</p>
        </motion.header>
        <div className="rwx-benefits">
          {BENEFITS.map((b) => (
            <motion.article key={b.title} className="rwx-benefit" {...fadeUp}>
              <span className="rwx-benefit-ic" aria-hidden="true">{b.ic}</span>
              <h3>{b.title}</h3>
              <p>{b.text}</p>
              <span className="rwx-benefit-tag">{b.tag}
                <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
              </span>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== THE MATH ===== */}
      <section className="rwx-math">
        <motion.div className="rwx-math-left" {...fadeUp}>
          <p className="rwx-eyebrow">The Math Is Simple</p>
          <h2>Every Bite Brings You Closer</h2>
          <p className="rwx-eq"><span>1 EGP</span><em>·</em><strong>10 Points</strong></p>
          <p className="rwx-math-text">Order your favorite classic meals and watch your balance grow instantly. No complicated rules, blackout dates, or confusing conversions.</p>
          <ul className="rwx-bullets">
            {EARN_BULLETS.map((t) => <li key={t}><span className="rwx-dot" aria-hidden="true" />{t}</li>)}
          </ul>
        </motion.div>
        <motion.div className="rwx-math-media" {...fadeUp}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bondok/home/fav-bondok-meal.webp" alt="Bondok meal" />
          <span className="rwx-math-tag">⚡ Points Credited on Checkout</span>
        </motion.div>
      </section>

      {/* ===== MILESTONE TRACKER ===== */}
      <section id="tiers" className="rwx-tiers">
        <motion.header className="rwx-head" {...fadeUp}>
          <p className="rwx-eyebrow">Milestone Tracker</p>
          <h2>Start Eating. Start Earning.</h2>
          <p className="rwx-sub">Each tier unlocks higher-tier free dishes. The higher you climb, the tastier the rewards become.</p>
        </motion.header>
        <div className="rwx-tier-row">
          {TIERS.map((t) => (
            <motion.article key={t.name} className={`rwx-tier is-${t.state}`} {...fadeUp}>
              <span className="rwx-tier-badge">
                {t.state === 'current' ? 'Current Goal' : t.state === 'done' ? 'Unlocked' : 'Locked'}
              </span>
              <span className="rwx-tier-mark" aria-hidden="true">
                {t.state === 'locked'
                  ? <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M6 10V7a6 6 0 0 1 12 0v3h1v11H5V10zm2 0h8V7a4 4 0 0 0-8 0z" /></svg>
                  : <svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="m5 12 5 5 9-11" /></svg>}
              </span>
              {t.state === 'current' && <span className="rwx-tier-status">In Progress</span>}
              <h3>{t.name}</h3>
              <p className="rwx-tier-pts">{t.pts}</p>
              <p className="rwx-tier-free">{t.free}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== FIRST REWARD ===== */}
      <section className="rwx-first">
        <motion.header className="rwx-head rwx-head-left" {...fadeUp}>
          <p className="rwx-eyebrow">Join &amp; Enjoy</p>
          <h2>Your First Reward Is On Us</h2>
          <p className="rwx-sub">Sign up today and get your choice of an instant free welcome side with your first qualified order.</p>
          <span className="rwx-first-tag">⏱ Valid for 14 Days Post-Registration</span>
        </motion.header>
        <div className="rwx-first-row">
          {FIRST.map((f) => (
            <motion.article key={f.title} className="rwx-first-card" {...fadeUp}>
              <div className="rwx-first-img">
                <span className="rwx-free-badge">FREE</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.title} loading="lazy" />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <button className="rwx-claim">Claim Reward
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M13 5v6h6v2h-6v6h-2v-6H5v-2h6V5z" transform="rotate(45 12 12)" /></svg>
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== IT'S EASY ===== */}
      <section id="how" className="rwx-easy">
        <motion.header className="rwx-head" {...fadeUp}>
          <p className="rwx-eyebrow">It&apos;s Easy</p>
          <h2>Eat. Earn. Enjoy.</h2>
          <p className="rwx-sub">Get into the flavor loop in 3 effortless actions. No loyalty card to carry, no coupons to clip.</p>
        </motion.header>
        <div className="rwx-easy-row">
          {HOWSTEPS.map((s) => (
            <motion.div key={s.n} className="rwx-easy-card" {...fadeUp}>
              <span className="rwx-easy-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <span className="rwx-easy-link">{s.link} →</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== REWARDS MENU ===== */}
      <section id="menu" className="rwx-menu">
        <motion.header className="rwx-head rwx-head-left rwx-menu-head" {...fadeUp}>
          <div>
            <p className="rwx-eyebrow">The Rewards Menu</p>
            <h2>What Will You Unlock?</h2>
            <p className="rwx-sub">Exchange points for anything on this list. Freshly prepared upon redemption.</p>
          </div>
          <div className="rwx-menu-filters">
            {MENU_FILTERS.map((f) => (
              <button key={f} className={`rwx-menu-filter${menuFilter === f ? ' is-on' : ''}`} onClick={() => setMenuFilter(f)}>{f}</button>
            ))}
          </div>
        </motion.header>
        <div className="rwx-menu-row">
          {MENU.map((m) => (
            <motion.article key={m.name} className={`rwx-menu-card${m.popular ? ' is-popular' : ''}`} {...fadeUp}>
              {m.popular && <span className="rwx-menu-ribbon">Popular</span>}
              <div className="rwx-menu-img">
                <span className="rwx-menu-pts">{m.pts} PTS</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} loading="lazy" />
              </div>
              <h3>{m.name}</h3>
              <p>{m.text}</p>
              {m.ok
                ? <button className="rwx-redeem">Redeem {m.pts} PTS</button>
                : <button className="rwx-redeem is-locked" disabled>Unlock at {m.pts} PTS</button>}
            </motion.article>
          ))}
        </div>
      </section>

      {/* ===== TRACK YOUR REWARDS (sample account) ===== */}
      <section className="rwx-track">
        <motion.header className="rwx-head" {...fadeUp}>
          <p className="rwx-eyebrow">Your Bondok Account</p>
          <h2>Track Your Rewards</h2>
        </motion.header>
        <motion.div className="rwx-account" {...fadeUp}>
          <div className="rwx-account-main">
            <div className="rwx-account-user">
              <span className="rwx-account-avatar" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" /></svg>
              </span>
              <div>
                <p className="rwx-account-hi">Welcome back,</p>
                <h3>Omar Farooq</h3>
              </div>
            </div>
            <div className="rwx-account-bal">
              <div className="rwx-account-bal-head">
                <span>Current Balance</span>
                <span className="rwx-account-tier">Bondok VIP Tier</span>
              </div>
              <p className="rwx-account-num">850 <span>Points</span></p>
              <div className="rwx-account-bar"><span style={{ width: '70%' }} /></div>
              <div className="rwx-account-bar-meta">
                <span>Level 3 (800 pts)</span>
                <span>350 pts to Bondok Feast (1200 pts)</span>
              </div>
            </div>
            <div className="rwx-account-stats">
              <div><strong>12</strong><span>Orders</span></div>
              <div><strong>4</strong><span>Claimed</span></div>
              <div><strong>EGP 320</strong><span>Saved</span></div>
            </div>
          </div>
          <div className="rwx-account-next">
            <p className="rwx-account-next-cap">Next Unlock</p>
            <h4>Bondok Classic Meal</h4>
            <div className="rwx-account-next-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bondok/menu/meals/classic-meal.webp" alt="Classic Meal" loading="lazy" />
            </div>
            <button className="rwx-keep">Keep Earning →</button>
          </div>
        </motion.div>
        <p className="rwx-sample-note">Sample account preview - real balances and history connect once the loyalty program launches.</p>
      </section>

      {/* ===== FAQ ===== */}
      <section id="rewards-faq" className="rwx-faq">
        <motion.header className="rwx-head" {...fadeUp}>
          <p className="rwx-eyebrow">Got Questions?</p>
          <h2>Bondok Rewards FAQs</h2>
        </motion.header>
        <div className="rwx-faq-tabs" role="tablist" aria-label="FAQ categories">
          {Object.keys(FAQ_CATS).map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={faqCat === cat}
              className={`rwx-faq-tab${faqCat === cat ? ' is-active' : ''}`}
              onClick={() => { setFaqCat(cat); setOpenQ(null); }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="rwx-faq-list">
          {FAQ_CATS[faqCat].map((f, i) => (
            <div key={f.q} className={`rwx-faq-item${openQ === i ? ' is-open' : ''}`}>
              <button className="rwx-faq-q" aria-expanded={openQ === i} onClick={() => setOpenQ(openQ === i ? null : i)}>
                {f.q}
                <svg className="rwx-faq-chev" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {openQ === i && <p className="rwx-faq-a">{f.a}</p>}
            </div>
          ))}
        </div>
        <p className="rw2-disclaimer">
          Disclaimer: the Bondok Rewards details shown here are placeholders. Points values, tiers,
          freebies, and the sample account are illustrative until the loyalty program launches.
        </p>
      </section>
    </div>
  );
}
