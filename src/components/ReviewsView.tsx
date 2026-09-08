'use client';

/* Reviews page - built to the designer's approved layout.
   All review content is sample data until Google Reviews connect;
   videos + community photos are client-file placeholders. */

import { useState } from 'react';
import { summary, featured, gridReviews } from '@/lib/reviews';

function Stars({ n = 5, size = 16 }: { n?: number; size?: number }) {
  return (
    <span className="rv-stars" aria-label={`${n} stars`}>
      {Array.from({ length: n }, (_, i) => (
        <svg key={i} viewBox="0 0 78 75" width={size} height={size} fill="currentColor" aria-hidden="true">
          <path d="M14.9 74l6.3-27.4L0 28.3l28-2.5L39 0l10.9 25.8 28 2.5-21.2 18.3L63 74 39 59.5 14.9 74z" />
        </svg>
      ))}
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return <span className="rv-avatar">{initials}</span>;
}

const FILTERS = [
  { key: 'all', label: `All (${summary.total.toLocaleString()})` },
  { key: '5', label: '★★★★★  5 Stars (1,060)' },
  { key: '4', label: '★★★★  4 Stars (124)' },
];

export default function ReviewsView() {
  const [filter, setFilter] = useState('all');
  const [formStars, setFormStars] = useState(5);
  const [sent, setSent] = useState(false);

  const visible = filter === '4' ? [] : gridReviews;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="rv-page">
      {/* hero */}
      <header className="rv-hero">
        <p className="rv-eyebrow"><span className="rv-dot" aria-hidden="true" />Real people. Real taste.</p>
        <h1>What people say<br />about Bondok?</h1>
        <p className="rv-sub">
          Thousands of food lovers have shared their Bondok experience. See what they have
          to say about our food, service, and unforgettable taste.
        </p>
      </header>

      {/* rating summary card */}
      <section className="rv-summary" aria-label="Overall rating">
        <div className="rv-score">
          <p className="rv-score-num">{summary.score.toFixed(1)} <span>/ {summary.outOf.toFixed(1)}</span></p>
          <Stars size={21} />
          <p className="rv-score-blurb">{summary.blurb}</p>
          <p className="rv-score-aud">{summary.audience}</p>
        </div>
        <div className="rv-bars">
          {summary.histogram.map((pct, i) => (
            <div key={i} className="rv-bar-row">
              <span className="rv-bar-label">{5 - i} Star{5 - i > 1 ? 's' : ''}</span>
              <span className="rv-bar-track"><span className="rv-bar-fill" style={{ width: `${pct}%` }} /></span>
              <span className="rv-bar-pct">{pct}%</span>
            </div>
          ))}
        </div>
        <div className="rv-summary-cta">
          <a href="#rv-form" className="btn btn-solid rv-write-btn">
            Write Review
            <svg viewBox="0 0 54 54" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
          </a>
          <span className="rv-write-note">Takes under 60 seconds</span>
        </div>
      </section>

      {/* customer favorites */}
      <section className="rv-favorites">
        <p className="rv-kicker">Customer favorites</p>
        <h2>They tried it. They loved it.</h2>
        <div className="rv-fav-grid">
          {featured.map((r) => (
            <article key={r.name} className="rv-fav-card">
              <div className="rv-card-head">
                <Avatar initials={r.initials} />
                <div>
                  <p className="rv-name">{r.name} <span className="rv-verified" aria-label="verified">✱</span></p>
                  <p className="rv-meta">{r.branch} · {r.when}</p>
                </div>
              </div>
              <Stars size={15} />
              <p className="rv-text">{r.text}</p>
              <div className="rv-chips">
                {r.chips.map((c) => <span key={c} className="rv-chip">{c}</span>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* filter bar + grid */}
      <section className="rv-all" aria-label="All reviews">
        <div className="rv-filterbar">
          <div className="rv-filters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`rv-filter${filter === f.key ? ' is-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="rv-sort">
            <span>Sort by:</span>
            <button className="rv-sort-btn">Most Recent</button>
          </div>
        </div>

        <div className="rv-grid">
          {visible.map((r) => (
            <article key={r.name} className="rv-card">
              <div className="rv-card-head">
                <Avatar initials={r.initials} />
                <div>
                  <p className="rv-name">{r.name}</p>
                  <p className="rv-meta">{r.branch} · {r.when}</p>
                </div>
                <Stars size={12} />
              </div>
              <p className="rv-text">{r.text}</p>
              <div className="rv-card-foot">
                <span className="rv-chip">{r.tag}</span>
                <span className="rv-helpful">
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" d="M7 11v9H4a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1h3zm0 0 4-7a2 2 0 0 1 2 2v4h6a1.5 1.5 0 0 1 1.5 1.8l-1.3 6.6A2 2 0 0 1 17.2 20H7" /></svg>
                  {r.helpful}
                </span>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <p className="rv-empty">4-star reviews load once Google Reviews are connected.</p>
        )}

        <div className="rv-loadmore-wrap">
          <button className="rv-loadmore">
            Load More Reviews (Showing {visible.length || 0} of {summary.total.toLocaleString()})
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
          </button>
        </div>
      </section>

      {/* video reactions */}
      <section className="rv-videos">
        <p className="rv-kicker">See the reaction</p>
        <h2>Real bites. Real reactions.</h2>
        <p className="rv-section-sub">Watch Bondok lovers share their unfiltered first impressions.</p>
        <div className="rv-video-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rv-video" role="img" aria-label="Video review placeholder">
              <button className="rv-play" aria-label="Play video">
                <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path fill="currentColor" d="M8 5.5v13l11-6.5z" /></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* community */}
      <section className="rv-community">
        <div className="rv-community-head">
          <div>
            <p className="rv-kicker">Community moments</p>
            <h2>Bondok in the wild</h2>
            <p className="rv-section-sub">Real food moments captured by our community. Tag @BondokFriedChicken to be featured.</p>
          </div>
          <a className="rv-follow" href="#" onClick={(e) => e.preventDefault()}>
            Follow on Facebook
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7m0 0H9m8 0v8" /></svg>
          </a>
        </div>
        <div className="rv-community-grid">
          {[1, 2, 3].map((i) => <div key={i} className="rv-photo" role="img" aria-label="Community photo placeholder" />)}
        </div>
      </section>

      {/* CTA + review form */}
      <section id="rv-form" className="rv-cta">
        <div className="rv-cta-inner">
          <div className="rv-cta-copy">
            <span className="rv-cta-eyebrow">We love hearing from you!</span>
            <h2>Had a<br />great Bondok<br />moment?</h2>
            <p>
              Your feedback helps us make every bite even better. Leave a review, share your
              food photo, and get <strong>50 Bondok reward tokens</strong> directly in your account.
            </p>
          </div>
          <form className="rv-form" onSubmit={submit}>
            {sent ? (
              <div className="rv-form-done">
                <Stars n={formStars} size={22} />
                <p><strong>Thank you!</strong></p>
                <p>Your review was received - it goes live once reviews are connected.</p>
              </div>
            ) : (
              <>
                <label className="rv-form-label">Rate your overall experience</label>
                <div className="rv-form-stars" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`rv-form-star${s <= formStars ? ' is-on' : ''}`}
                      aria-label={`${s} star${s > 1 ? 's' : ''}`}
                      onClick={() => setFormStars(s)}
                    >
                      <svg viewBox="0 0 78 75" width="22" height="22" fill="currentColor" aria-hidden="true">
                        <path d="M14.9 74l6.3-27.4L0 28.3l28-2.5L39 0l10.9 25.8 28 2.5-21.2 18.3L63 74 39 59.5 14.9 74z" />
                      </svg>
                    </button>
                  ))}
                </div>
                <label className="rv-form-label" htmlFor="rv-branch">Branch Visited or Ordered From</label>
                <input id="rv-branch" className="rv-input" defaultValue="Bondok Nasr City" />
                <label className="rv-form-label" htmlFor="rv-review">Your Review</label>
                <textarea
                  id="rv-review"
                  className="rv-input rv-textarea"
                  placeholder="What made your meal special? How was the crunch and flavor?"
                  rows={3}
                />
                <button type="submit" className="btn btn-solid rv-submit">
                  Share Your Experience
                  <svg viewBox="0 0 54 54" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
