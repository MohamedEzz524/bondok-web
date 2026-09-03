import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Reviews — Bondok Fried Chicken' };

/* structural placeholder: Google Reviews connect with the client's
   Business Profile access; video reviews from client files */
export default function Page() {
  return (
    <div className="reviews-page">
      <div className="menu-head">
        <h1>What people say</h1>
        <p>Real reviews from Bondok customers.</p>
      </div>

      <section className="reviews-summary">
        <div className="reviews-score">
          <strong>—</strong>
          <span>Google rating</span>
        </div>
        <p>Live Google Reviews appear here once the Bondok Business Profile is connected.</p>
      </section>

      <section className="reviews-grid" aria-label="Customer reviews placeholder">
        {[1, 2, 3].map((i) => (
          <div key={i} className="review-card is-placeholder">
            <div className="review-stars">★★★★★</div>
            <p>Customer review placeholder - real reviews load from Google.</p>
            <span>— Bondok customer</span>
          </div>
        ))}
      </section>

      <section className="reviews-videos">
        <h2>Video reviews</h2>
        <div className="reviews-video-grid">
          {[1, 2].map((i) => (
            <div key={i} className="review-video is-placeholder">
              <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
                <circle cx="12" cy="12" r="11" fill="#e09344" />
                <path fill="#fff" d="M10 8.5v7l6-3.5z" />
              </svg>
              <span>Video slot - client files pending</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
