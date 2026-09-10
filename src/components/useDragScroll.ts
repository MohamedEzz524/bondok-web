'use client';

/* Shared drag-to-scroll for horizontal carousels/strips.
   - Mouse: click-drag to scroll, with momentum (inertia) on release.
   - Touch: left to native scrolling (best on mobile).
   - Suppresses the click after a real drag so cards don't activate.
   - Temporarily disables scroll-snap while dragging for a fluid feel.
   Spread the returned handlers on the scrolling element and attach `ref`. */

import { useCallback, useEffect, useRef } from 'react';

export function useDragScroll<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const st = useRef({ down: false, moved: false, startX: 0, scroll: 0, v: 0, raf: 0 });

  useEffect(() => () => { if (st.current.raf) cancelAnimationFrame(st.current.raf); }, []);

  const stopMomentum = () => { if (st.current.raf) { cancelAnimationFrame(st.current.raf); st.current.raf = 0; } };

  const onPointerDown = useCallback((e: React.PointerEvent<T>) => {
    if (e.pointerType !== 'mouse') return; // touch keeps native scroll
    const el = ref.current;
    if (!el) return;
    stopMomentum();
    st.current.down = true;
    st.current.moved = false;
    st.current.startX = e.clientX;
    st.current.scroll = el.scrollLeft;
    st.current.v = 0;
    /* NOTE: do NOT capture the pointer or disable snap here — a plain click must
       reach the button underneath. Pointer capture on pointerdown makes the
       browser fire `click` on this container instead of the target (breaks
       tabs/chips). We upgrade to a drag only once the pointer actually moves. */
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || !st.current.down) return;
    const dx = e.clientX - st.current.startX;
    if (!st.current.moved) {
      if (Math.abs(dx) <= 4) return;            // still a potential click — leave it alone
      st.current.moved = true;                  // now it's a drag: capture + free-scroll
      el.style.scrollSnapType = 'none';
      try { el.setPointerCapture(e.pointerId); } catch { /* capture unsupported */ }
    }
    const prev = el.scrollLeft;
    el.scrollLeft = st.current.scroll - dx;
    st.current.v = el.scrollLeft - prev; // px/frame-ish, for inertia
  }, []);

  const end = useCallback((e: React.PointerEvent<T>) => {
    const el = ref.current;
    if (!el || !st.current.down) return;
    st.current.down = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    if (!st.current.moved) return;              // plain click: nothing captured/snapped to undo
    const restoreSnap = () => { el.style.scrollSnapType = ''; };
    let v = st.current.v;
    if (Math.abs(v) < 1) { restoreSnap(); return; }
    const step = () => {
      el.scrollLeft += v;
      v *= 0.92;
      if (Math.abs(v) > 0.5) { st.current.raf = requestAnimationFrame(step); }
      else { st.current.raf = 0; restoreSnap(); }
    };
    st.current.raf = requestAnimationFrame(step);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent<T>) => {
    if (st.current.moved) { e.preventDefault(); e.stopPropagation(); }
  }, []);

  return {
    ref,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onClickCapture,
    },
  };
}
