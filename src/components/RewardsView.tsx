'use client';

/* Bondok Rewards landing - structural placeholder for the loyalty program
   (a future-phase project per scope). Animated hero + sections so the
   designer reviews real motion. All program details are placeholders. */

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.45, ease: 'easeOut' as const },
};

const FLOATERS = [
  { left: '4%', top: '12%', size: 64, delay: 0 },
  { left: '16%', top: '28%', size: 40, delay: 0.8 },
  { left: '28%', top: '10%', size: 30, delay: 1.6 },
  { left: '44%', top: '22%', size: 48, delay: 0.4 },
  { left: '60%', top: '8%', size: 34, delay: 1.2 },
];

export default function RewardsView() {
  const reduced = useReducedMotion();

  return (
    <div className="rewards-page">
      {/* anchor sub-nav (reference pattern) */}
      <nav className="subnav rewards-subnav" aria-label="Rewards sections">
        <a href="#freebies">Freebies</a>
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
            <svg viewBox="0 0 24 24" width="60%" height="60%" fill="currentColor">
              <path d="M13.6.8c0 .3.4.5.1.7H13c-.4 0-1.1.4-1.2.9 0 .3.7.7.2.8-.5 0-.9-.6-1.1 0l-.4.6-.1.7-.8.3-.2.8q-.1 1-.8 1.6-.3.1-.5.4 0 .4.3.6l-.2.4-.4.2q-.2.2-.3.8l-.2.8q.1.3.4.5c.1.7-.7.8-.9 1.3q0 .3.3.4h.5q.3 0 .4.3l-.2.4-.4.6v.7l.2.3q0 .3-.3.5L6 17c-.3.3-.6 1-1.1.8l-1.2-.4q-.7 0-1.2.6v1q.1 1.1.7 2l.2.4.1.2-.1.8.1.6q.4.8 1.2 1 1.7.2 2.2-1.2.2-.6 0-1.1t0-.9l1.4-2.4s.4-.7.3-.9q-.5 0-.9.5l-.9 1.2-.8 1.1c-.8-.6-1.3 0-2 .5a3 3 0 0 1-.4-2q0-.5.6-.4l.6.4q.5 0 .6-.4l1-.8 1-1L8 16q.1-.4.4-.6 0-.2.3 0l.1.5c0 .7.2 1.6 1 1.4.4 0 .6-.4.9-.4.4-.2.5-.1.8-.6q0-.5.6-.7.4.2.6 0l.3.1.3.4q.4 0 .6-.2l.6-.4.2-.5c.5-1.1 2-.2 2.5-1l.5-.5q.4-.2.4-.5c.1-.5.2 0 .5-.2v-.3h.3l.5-.6q.2-.3.8-.5.3 0 .2-.6l-.5-.2q-.2 0 0-.2t.2-.7v-.2q.4 0 .5-.4h.1q.2 0 .3-.2l-.2-.5q-.1-.4.2-.5t.5-.3c.2-.4-.3-.6-.5-.7l-.5-.6.1-.4.5-.6q-.1-.5-.4-.8c-.3-.3.5-.6.4-.9q-.2-.4-.8-.4l-.3-.4-.5-.4-1-.5q0-.3-.3-.3l-.3-.3V.7l-.2-.2h-1l-.3-.5q-.4 0-.6.2l-.4.5q-.4.1-.6-.2c-.3 0-1.2 0-1.2.3" />
            </svg>
          </motion.span>
        ))}

        <div className="rw-hero-inner">
          <motion.div className="rw-hero-copy" {...fadeUp}>
            <div className="drawer-brand rw-brand">
              <span className="drawer-brand-top">Bondok</span>
              <span className="drawer-brand-rewards">Rewards</span>
            </div>
            <h1>More chicken, more smiles - earn free food every order</h1>
            <p className="rw-points">Earn points with every EGP you spend</p>
            <button className="btn rw-signup">Sign Up</button>
            <span className="rw-fine">Program details are being finalized - points values and freebies announced at launch.</span>
          </motion.div>
          <motion.div className="rw-hero-media" {...fadeUp} transition={{ duration: 0.45, delay: 0.15, ease: 'easeOut' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bondok/hero-12pcs.webp" alt="Bondok bucket meal" />
          </motion.div>
        </div>
      </section>

      {/* freebies */}
      <motion.section id="freebies" className="rw-section" {...fadeUp}>
        <h2>Freebies you can earn</h2>
        <p>Redeem points for the food you already love.</p>
        <div className="rw-freebies">
          {[
            { img: '/bondok/fav-tenders.webp', name: '6 Pcs Tenders' },
            { img: '/bondok/fav-chicken-fillet.webp', name: 'Chicken Fillet Sandwich' },
            { img: '/bondok/feat-sides.webp', name: 'Cheese Fries' },
            { img: '/bondok/hero-shrimp-roll.webp', name: 'Shrimp Roll' },
          ].map((f) => (
            <div key={f.name} className="rw-freebie">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.img} alt={f.name} loading="lazy" />
              <span>{f.name}</span>
              <em>points TBD</em>
            </div>
          ))}
        </div>
      </motion.section>

      {/* how it works */}
      <motion.section id="how" className="rw-section rw-how" {...fadeUp}>
        <h2>How it works</h2>
        <div className="rw-steps">
          {[
            { n: 1, t: 'Sign up', d: 'Just your phone number - no passwords, no forms.' },
            { n: 2, t: 'Earn points', d: 'Every order adds points to your balance automatically.' },
            { n: 3, t: 'Eat free', d: 'Swap points for freebies whenever you are ready.' },
          ].map((s) => (
            <div key={s.n} className="rw-step">
              <span className="rw-step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section id="rewards-faq" className="rw-section" {...fadeUp}>
        <h2>Rewards FAQ</h2>
        <p>
          Full program terms arrive with the rewards launch. Meanwhile, questions are welcome
          through <Link href="/complaints" className="rw-link">Complaints &amp; Suggestions</Link>.
        </p>
      </motion.section>
    </div>
  );
}
