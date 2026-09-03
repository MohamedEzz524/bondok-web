import type { Metadata } from 'next';
import Link from 'next/link';
import CateringFaq from '@/components/CateringFaq';

export const metadata: Metadata = {
  title: 'Catering — Bondok Fried Chicken',
  description: 'Bondok catering for gatherings, work events, and celebrations - order ahead for your event.',
};

/* Standalone landing cloned from the reference catering page: own minimal
   header + compact dark footer (global chrome is hidden on this route).
   All copy/images are Bondok placeholders. */

const sparkle = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0l2.4 7.6L22 10l-7.6 2.4L12 20l-2.4-7.6L2 10l7.6-2.4L12 0z" />
  </svg>
);

/* hero collage - positions mirror the reference food spread */
const HERO_ART = [
  { src: '/bondok/hero-12pcs.webp', style: { left: '37%', bottom: '-8%', width: '42%' } },
  { src: '/bondok/hero-tenders.webp', style: { left: '49%', top: '-14%', width: '29%' } },
  { src: '/bondok/feat-rolls.webp', style: { right: '-4%', top: '-13%', width: '29%' } },
  { src: '/bondok/feat-sides.webp', style: { right: '2%', top: '40%', width: '17%' } },
  { src: '/bondok/fav-tenders.webp', style: { right: '-5%', bottom: '-14%', width: '34%' } },
];

const DOODLES = [
  { style: { left: '40%', top: '12%', width: 30 } },
  { style: { left: '64%', top: '58%', width: 24 } },
  { style: { right: '24%', top: '30%', width: 16 } },
];

export default function Page() {
  return (
    <div className="catering-page">
      {/* landing header (reference: logo + anchors + Order Now pill) */}
      <header className="cat-header">
        <div className="cat-header-inner">
          <Link href="/" aria-label="Bondok Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-img" src="/bondok/logo.jpg" alt="Bondok Fried Chicken" />
          </Link>
          <nav className="cat-header-nav" aria-label="Catering sections">
            <a href="#benefits">Benefits</a>
            <a href="#events">Event Types</a>
            <a href="#catering-faq">FAQ</a>
            <Link href="/menu" className="btn btn-solid cat-header-cta">Order Now</Link>
          </nav>
        </div>
      </header>

      {/* orange hero with food collage */}
      <section className="cat-hero">
        <div className="cat-hero-art" aria-hidden="true">
          {HERO_ART.map((a) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={a.src} src={a.src} alt="" style={a.style} />
          ))}
          {DOODLES.map((d, i) => (
            <span key={i} className="cat-doodle" style={d.style}>{sparkle}</span>
          ))}
        </div>
        <div className="cat-hero-inner">
          <div className="cat-hero-copy">
            <h1>Feed the Whole Crowd with Bondok Catering</h1>
            <p>Turn your next gathering into a feast - golden fried chicken, sides, and sauces for everyone.</p>
            <Link href="/menu" className="btn cat-hero-btn">Order Now</Link>
            <span className="cat-hero-fine">Catering availability and minimums are being finalized per branch.</span>
          </div>
        </div>
      </section>

      {/* benefits */}
      <section id="benefits" className="cat-benefits">
        <div className="cat-benefits-inner">
          <h2>Feeding a Crowd? We Got You.</h2>
          <p className="cat-benefits-lead">
            Customizable trays and crowd-sized portions for any occasion. Order ahead and we will have
            everything hot and ready for your event.
          </p>
          <div className="cat-benefit-row">
            <div className="cat-benefit">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="var(--orange)" strokeWidth="1.1" strokeLinecap="round" d="M4 8h16l-1.5 12h-13zM8 8a4 4 0 0 1 8 0M9 12v4m3-4v4m3-4v4" /></svg>
              <div className="cat-benefit-text">
                <h3>Tasty Selection</h3>
                <p>From fried chicken trays to rolls and sides - build the spread your crowd wants.</p>
              </div>
            </div>
            <div className="cat-benefit">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="var(--orange)" strokeWidth="1.1" /><path fill="none" stroke="var(--orange)" strokeWidth="1.1" strokeLinecap="round" d="M12 7v5l3.5 2M12 1.5v1M12 21.5v1M1.5 12h1m19 0h1" /></svg>
              <div className="cat-benefit-text">
                <h3>Order Ahead</h3>
                <p>Skip the stress - place your order in advance and pick your delivery or pickup time.</p>
              </div>
            </div>
            <div className="cat-benefit">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="var(--orange)" strokeWidth="1.1" strokeLinecap="round" d="M3 13h11v-2H3zm0 4h11v-2H3zm15-1 4-4-4-4v3h-3v2h3zM3 9h9V7H3z" /></svg>
              <div className="cat-benefit-text">
                <h3>Fresh on Time</h3>
                <p>Your branch preps everything to arrive hot and fresh right when your event starts.</p>
              </div>
            </div>
          </div>
          <Link href="/menu" className="btn btn-solid cat-cta-xl">Order Ahead</Link>
        </div>
      </section>

      {/* event types */}
      <section id="events" className="cat-events">
        <div className="cat-events-inner">
          <h2>Ready for Any Celebration</h2>
          <p className="cat-events-sub">Perfect catering for any occasion, from birthdays to office events and more.</p>
          <div className="cat-event-row">
            <article className="cat-event">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bondok/feat-family.webp" alt="Family meal spread" />
              <h3>Family Gatherings</h3>
              <p>Score a big win at your next family get-together with buckets made for sharing.</p>
              <Link href="/menu?cat=meals" className="btn btn-outline">Order Now</Link>
            </article>
            <article className="cat-event">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bondok/hero-tenders.webp" alt="Tenders tray" />
              <h3>Work Events</h3>
              <p>Spice up your next office or school event with trays everyone will love.</p>
              <Link href="/menu?cat=kids-tenders" className="btn btn-outline">Order Now</Link>
            </article>
            <article className="cat-event">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/bondok/feat-sides.webp" alt="Sides tray" />
              <h3>Celebrations</h3>
              <p>Birthdays, wins, and everything worth celebrating - make it extra special.</p>
              <Link href="/menu?cat=sides" className="btn btn-outline">Order Now</Link>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="catering-faq" className="cat-faq">
        <div className="cat-faq-inner">
          <h2>FAQs</h2>
          <CateringFaq />
          <Link href="/menu" className="btn btn-solid cat-cta-xl">Order Catering</Link>
        </div>
      </section>

      {/* landing footer (reference: compact dark bar) */}
      <footer className="cat-footer">
        <div className="cat-footer-inner">
          <span className="cat-footer-logo">Bondok</span>
          <nav className="cat-footer-links" aria-label="Footer">
            <Link href="/support">Support</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/faq">FAQs</Link>
            <Link href="/branches">Branches</Link>
            <Link href="/delivery-terms">Delivery Terms</Link>
            <Link href="/offer-terms">Offer Terms</Link>
            <Link href="/complaints">Complaints &amp; Suggestions</Link>
          </nav>
          <div className="cat-footer-social">
            <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.5.2-1.8.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.8-.3 1.8-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.5.3 1.8.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.8.3 1.8.3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.5-.2 1.8-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.8.3-1.8.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.5-.3-1.8-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.8-.3-1.8-.3-1.2-.1-1.6-.1-4.7-.1zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8zm0 8.1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zm6.2-8.3a1.1 1.1 0 1 1-2.3 0 1.1 1.1 0 0 1 2.3 0z" /></svg></a>
            <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" /></svg></a>
            <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12c0 1.9.2 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.3-1.9.5-3.9.5-5.8s-.2-3.9-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" /></svg></a>
          </div>
        </div>
        <p className="cat-footer-bottom">TM &amp; &copy; 2026 Bondok Fried Chicken.</p>
      </footer>
    </div>
  );
}
