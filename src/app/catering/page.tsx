import type { Metadata } from 'next';
import Link from 'next/link';
import CateringFaq from '@/components/CateringFaq';

export const metadata: Metadata = {
  title: 'Catering — Bondok Fried Chicken',
  description: 'Bondok catering for gatherings, work events, and celebrations - order ahead for your event.',
};

/* structure follows the reference catering page; all content is Bondok's */
export default function Page() {
  return (
    <div className="catering-page">
      {/* anchor sub-nav */}
      <nav className="subnav" aria-label="Catering sections">
        <a href="#benefits">Benefits</a>
        <a href="#events">Event Types</a>
        <a href="#catering-faq">FAQ</a>
        <Link href="/menu" className="btn btn-solid subnav-cta">Order Now</Link>
      </nav>

      {/* orange hero */}
      <section className="cat-hero">
        <div className="cat-hero-inner">
          <div className="cat-hero-copy">
            <h1>Feed the Whole Crowd with Bondok Catering</h1>
            <p>Turn your next gathering into a feast - golden fried chicken, sides, and sauces for everyone.</p>
            <Link href="/complaints" className="btn cat-hero-btn">Request Catering</Link>
            <span className="cat-hero-fine">Catering availability and minimums are being finalized per branch.</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cat-hero-img" src="/bondok/feat-family.webp" alt="Bondok family meal spread" />
        </div>
      </section>

      {/* benefits */}
      <section id="benefits" className="cat-benefits">
        <h2>Feeding a Crowd? We Got You.</h2>
        <p className="cat-benefits-lead">
          Customizable trays and crowd-sized portions for any occasion. Order ahead and we will have
          everything hot and ready for your event.
        </p>
        <div className="cat-benefit-row">
          <div className="cat-benefit">
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><path fill="none" stroke="#dd8226" strokeWidth="1.6" d="M4 8h16l-1.5 12h-13zM8 8a4 4 0 0 1 8 0" /></svg>
            <h3>Tasty Selection</h3>
            <p>From fried chicken trays to rolls and sides - build the spread your crowd wants.</p>
          </div>
          <div className="cat-benefit">
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#dd8226" strokeWidth="1.6" /><path fill="none" stroke="#dd8226" strokeWidth="1.6" d="M12 7v5l3.5 2" /></svg>
            <h3>Order Ahead</h3>
            <p>Skip the stress - place your order in advance and pick your delivery or pickup time.</p>
          </div>
          <div className="cat-benefit">
            <svg viewBox="0 0 24 24" width="44" height="44" aria-hidden="true"><path fill="none" stroke="#dd8226" strokeWidth="1.6" d="M3 13h11v-2H3v2zm0 4h11v-2H3v2zm15-1 4-4-4-4v3h-3v2h3v3zM3 9h9V7H3v2z" /></svg>
            <h3>Fresh on Time</h3>
            <p>Your branch preps everything to arrive hot and fresh right when your event starts.</p>
          </div>
        </div>
        <Link href="/complaints" className="btn btn-solid">Request Catering</Link>
      </section>

      {/* event types */}
      <section id="events" className="cat-events">
        <h2>Ready for Any Celebration</h2>
        <p>Perfect catering for any occasion - from birthdays to office events and more.</p>
        <div className="cat-event-row">
          <article className="cat-event">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bondok/hero-12pcs.webp" alt="12 pieces bucket" />
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
      </section>

      {/* FAQ */}
      <section id="catering-faq" className="cat-faq">
        <h2>FAQs</h2>
        <CateringFaq />
        <Link href="/complaints" className="btn btn-solid">Request Catering</Link>
      </section>
    </div>
  );
}
