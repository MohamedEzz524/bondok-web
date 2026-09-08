'use client';

/* Crowd favorites - 4 visible at a time, auto-rotating through the full
   list (one card per step, seamless loop). Pauses on hover/touch and
   respects reduced motion; arrows allow manual control. */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { favorites } from '@/lib/data';

const VISIBLE = 4;
const STEP_MS = 3200;
const SLIDE_MS = 480;

export default function Favorites() {
  const [idx, setIdx] = useState(0);
  const [anim, setAnim] = useState(true);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);
  const len = favorites.length;

  /* clone the first page so the loop wraps seamlessly */
  const track = [...favorites, ...favorites.slice(0, VISIBLE)];

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || len <= VISIBLE) return;
    const t = setInterval(() => {
      if (reduced.current) return;
      setIdx((i) => i + 1);
    }, STEP_MS);
    return () => clearInterval(t);
  }, [paused, len]);

  /* after sliding onto the cloned page, snap back to the real start */
  useEffect(() => {
    if (idx < len) return;
    const t = setTimeout(() => {
      setAnim(false);
      setIdx(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    }, SLIDE_MS);
    return () => clearTimeout(t);
  }, [idx, len]);

  const prev = () => setIdx((i) => (i <= 0 ? len - 1 : i - 1));
  const next = () => setIdx((i) => (i >= len ? 1 : i + 1));

  return (
    <section
      className="favorites"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="favorites-head">
        <h4>Try out our crowd favorites</h4>
        {len > VISIBLE && (
          <div className="favorites-nav" aria-hidden="false">
            <button aria-label="Previous favorites" onClick={prev}>‹</button>
            <button aria-label="Next favorites" onClick={next}>›</button>
          </div>
        )}
      </div>
      <div className="favorites-vp">
        <div
          className="favorites-track"
          style={{
            transform: `translateX(-${idx * (100 / VISIBLE)}%)`,
            transition: anim ? `transform ${SLIDE_MS}ms ease` : 'none',
          }}
        >
          {track.map((f, i) => (
            <Link key={`${f.title}-${i}`} className="fav-card" href={f.href} tabIndex={i >= len ? -1 : undefined}>
              <div className="fav-imgwrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="fav-photo" src={f.image} alt={f.alt} loading={i < VISIBLE ? undefined : 'lazy'} />
              </div>
              <div className="fav-title">{f.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
