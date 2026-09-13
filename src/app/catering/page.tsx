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

export default function Page() {
  return (
    <div className="catering-page">
      {/* sticky anchor strip below the global header (matches the rewards sub-nav) */}
      <nav className="subnav cat-subnav" aria-label="Catering sections">
        <a href="#benefits">Benefits</a>
        <a href="#events">Event Types</a>
        <a href="#catering-faq">FAQ</a>
      </nav>

      {/* hero: accent-orange with floating food (reference Frame 38) */}
      <section className="cat-hero">
        <div className="cat-hero-art" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cat-float cf-f0" src="/bondok/catering/f0.webp" alt="" />
        </div>
        <div className="cat-hero-inner">
          <div className="cat-hero-copy">
            <h1>Feed the Whole Crowd with Bondok Catering</h1>
            <p>Turn your next gathering into a feast - golden fried chicken, crunchy sides, and signature sauces, portioned for everyone at the table.</p>
            <Link href="/menu" className="btn cat-hero-btn">Order Now</Link>
            <span className="cat-hero-fine">Catering availability and minimums are being finalized per branch.</span>
          </div>
        </div>
      </section>

      {/* benefits */}
      <section id="benefits" className="cat-benefits">
        {/* eslint-disable @next/next/no-img-element */}
        <img className="cat-float cf-f5" src="/bondok/catering/f5.webp" alt="" aria-hidden="true" />
        <img className="cat-float cf-f2" src="/bondok/catering/f2.webp" alt="" aria-hidden="true" />
        <img className="cat-float cf-f3" src="/bondok/catering/f3.webp" alt="" aria-hidden="true" />
        {/* eslint-enable @next/next/no-img-element */}
        <div className="cat-benefits-inner">
          <h2>Feeding a Crowd? We Got You.</h2>
          <p className="cat-benefits-lead">
            Customizable trays and crowd-sized portions for any occasion. Place your order ahead with your
            nearest branch and our team will confirm timing, trays, and delivery details - so everything
            arrives hot and ready right when your event starts, with no stress on the big day.
          </p>
          <div className="cat-benefit-row">
            <div className="cat-benefit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cat-benefit-ic" src="/bondok/catering/icon1.webp" alt="" />
              <div className="cat-benefit-text">
                <h3>Tasty Selection</h3>
                <p>From fried chicken trays to rolls and sides - build the spread your crowd wants.</p>
              </div>
            </div>
            <div className="cat-benefit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cat-benefit-ic" src="/bondok/catering/icon2.webp" alt="" />
              <div className="cat-benefit-text">
                <h3>Order Ahead</h3>
                <p>Skip the stress - place your order in advance and pick your delivery or pickup time.</p>
              </div>
            </div>
            <div className="cat-benefit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="cat-benefit-ic" src="/bondok/catering/icon3.webp" alt="" />
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
        {/* eslint-disable @next/next/no-img-element */}
        <img className="cat-float cf-f1" src="/bondok/catering/f1.webp" alt="" aria-hidden="true" />
        <img className="cat-float cf-f8" src="/bondok/catering/f8.webp" alt="" aria-hidden="true" />
        <img className="cat-float cf-f6" src="/bondok/catering/f6.webp" alt="" aria-hidden="true" />
        {/* eslint-enable @next/next/no-img-element */}
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
        {/* eslint-disable @next/next/no-img-element */}
        <img className="cat-float cf-f4" src="/bondok/catering/f4.webp" alt="" aria-hidden="true" />
        <img className="cat-float cf-f7" src="/bondok/catering/f7.webp" alt="" aria-hidden="true" />
        {/* eslint-enable @next/next/no-img-element */}
        <div className="cat-faq-inner">
          <h2>FAQs</h2>
          <CateringFaq />
          <Link href="/menu" className="btn btn-solid cat-cta-xl">Order Catering</Link>
        </div>
      </section>
    </div>
  );
}
