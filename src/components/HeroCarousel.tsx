'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { heroSlides } from '@/lib/data';

const AUTOPLAY_MS = 5000;

type SlideState = '' | 'is-active' | 'is-prev' | 'is-next';

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const slideRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const prevStates = useRef<SlideState[]>(heroSlides.map(() => ''));
  const wrapTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(heroSlides.map(() => null));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hoverPaused = useRef(false);

  const n = heroSlides.length;

  const stateFor = useCallback(
    (i: number, idx: number): SlideState => {
      if (i === idx) return 'is-active';
      if (i === (idx - 1 + n) % n) return 'is-prev';
      if (i === (idx + 1) % n) return 'is-next';
      return '';
    },
    [n],
  );

  /* Apply slide classes imperatively so the circular wrap can fade out in
     place, relocate invisibly, then fade in - instead of flying across. */
  useEffect(() => {
    heroSlides.forEach((_, i) => {
      const el = slideRefs.current[i];
      if (!el) return;
      const state = stateFor(i, index);
      const old = prevStates.current[i];
      const farJump = (old === 'is-prev' && state === 'is-next') || (old === 'is-next' && state === 'is-prev');

      el.classList.remove('is-active', 'is-prev', 'is-next');
      const t = wrapTimers.current[i];
      if (t) clearTimeout(t);

      if (farJump) {
        el.classList.add(old);                     // hold position while fading out
        el.style.transition = 'opacity .18s ease';
        el.style.opacity = '0';
        wrapTimers.current[i] = setTimeout(() => {
          el.classList.remove('is-active', 'is-prev', 'is-next');
          el.style.transition = 'none';
          if (state) el.classList.add(state);      // relocate while invisible
          void el.offsetWidth;
          el.style.transition = 'opacity .25s ease';
          el.style.opacity = '';                   // fade in at the new side
          wrapTimers.current[i] = setTimeout(() => { el.style.transition = ''; }, 260);
        }, 190);
      } else {
        // reset any leftovers from an interrupted wrap sequence
        el.style.transition = '';
        el.style.opacity = '';
        if (state) el.classList.add(state);
      }
      prevStates.current[i] = state;
    });
  }, [index, stateFor]);

  const next = useCallback(() => setIndex((i) => (i + 1) % n), [n]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + n) % n), [n]);

  /* autoplay */
  useEffect(() => {
    if (!playing) return;
    const tick = () => { if (!hoverPaused.current) next(); };
    timerRef.current = setInterval(tick, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, next, index]);   // index dep restarts the interval after manual nav

  /* keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [prev, next]);

  /* touch/pointer swipe */
  const swipe = useRef({ down: false, startX: 0, moved: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { down: true, startX: e.clientX, moved: 0 };
    hoverPaused.current = true;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!swipe.current.down) return;
    const dx = e.clientX - swipe.current.startX;
    if (Math.abs(dx) > Math.abs(swipe.current.moved)) swipe.current.moved = dx;
  };
  const onPointerUp = () => {
    if (!swipe.current.down) return;
    swipe.current.down = false;
    hoverPaused.current = false;
    const dx = swipe.current.moved;
    if (dx <= -60) next();
    else if (dx >= 60) prev();
  };
  const suppressDragClick = (e: React.MouseEvent) => {
    if (Math.abs(swipe.current.moved) > 10) { e.preventDefault(); e.stopPropagation(); swipe.current.moved = 0; }
  };

  return (
    <section className="hero" aria-label="Promotions">
      <div className="hero-viewport">
        <div
          className="hero-track"
          onMouseEnter={() => { hoverPaused.current = true; }}
          onMouseLeave={() => { hoverPaused.current = false; }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onClickCapture={suppressDragClick}
          onDragStart={(e) => e.preventDefault()}
          style={{ touchAction: 'pan-y' }}
        >
          {heroSlides.map((s, i) => (
            <Link
              key={s.title}
              href={s.href}
              className="hero-slide"
              ref={(el) => { slideRefs.current[i] = el; }}
            >
              <div className={`promo${s.full ? ' promo-full' : ''}`}>
                {!s.full && (
                  <div className="promo-copy">
                    <h2>{s.title}</h2>
                    <p>{s.text}</p>
                    <span className="promo-btn">{s.cta}</span>
                  </div>
                )}
                {/* wide banner on desktop; square food crop on mobile */}
                <picture>
                  {s.mobileImage && <source media="(max-width: 768px)" srcSet={s.mobileImage} />}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="promo-img" src={s.image} alt={s.title} draggable={false} />
                </picture>
                {/* mobile-only headline + CTA over the food crop */}
                {s.full && s.mobileImage && (
                  <div className="promo-mcopy">
                    <h2>{s.title}</h2>
                    <span className="promo-btn">{s.cta}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
        <button className="hero-arrow hero-prev" aria-label="Previous slide" onClick={prev}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" /></svg>
        </button>
        <button className="hero-arrow hero-next" aria-label="Next slide" onClick={next}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L13.2 12z" /></svg>
        </button>
      </div>

      <div className="hero-controls">
        <button
          className="hero-pause"
          aria-label={playing ? 'Pause carousel' : 'Play carousel'}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5h3v14H8zm5 0h3v14h-3z" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z" /></svg>
          )}
        </button>
        <div className="hero-dots">
          {heroSlides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              className={i === index ? 'is-active' : ''}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
