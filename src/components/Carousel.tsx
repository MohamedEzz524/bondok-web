'use client';

/* Unified horizontal carousel: drag-to-scroll (from useDragScroll) + boundary-aware
   nav arrows. Wrap the scroll track in `.crsl-wrap`, spread `dragProps` on the track,
   and render <CarouselArrows> as siblings. Arrows auto show/hide at the track edges.
   Sizes/gutters vary per usage via CSS; the behavior here is shared. */

import { useCallback, useEffect, useState } from 'react';
import { useDragScroll } from './useDragScroll';

export interface CarouselNav { left: boolean; right: boolean; }

export function useCarousel<T extends HTMLElement = HTMLDivElement>() {
  const { ref, dragProps } = useDragScroll<T>();
  const [nav, setNav] = useState<CarouselNav>({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setNav((prev) => {
      const left = el.scrollLeft > 4;
      const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 4;
      return prev.left === left && prev.right === right ? prev : { left, right };
    });
  }, [ref]);

  const scrollByPage = useCallback((dir: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(180, el.clientWidth * 0.8), behavior: 'smooth' });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, update]);

  return { ref, dragProps: { ...dragProps, onScroll: update }, nav, scrollByPage, update };
}

export function CarouselArrows({ nav, onNav, className = '' }: {
  nav: CarouselNav;
  onNav: (dir: number) => void;
  className?: string;
}) {
  return (
    <>
      <button
        type="button"
        className={`crsl-arrow crsl-arrow-l${nav.left ? '' : ' is-off'}${className ? ' ' + className : ''}`}
        aria-label="Scroll left"
        tabIndex={nav.left ? 0 : -1}
        onClick={() => onNav(-1)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button
        type="button"
        className={`crsl-arrow crsl-arrow-r${nav.right ? '' : ' is-off'}${className ? ' ' + className : ''}`}
        aria-label="Scroll right"
        tabIndex={nav.right ? 0 : -1}
        onClick={() => onNav(1)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg>
      </button>
    </>
  );
}
