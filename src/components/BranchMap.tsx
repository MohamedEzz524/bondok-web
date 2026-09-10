'use client';

/* Custom-drawn (SVG) map placeholder — projects branch lat/lng onto a stylised
   canvas with pins, an optional delivery-coverage ring, and a "you" marker.
   Not a real tile map; a believable stand-in until a maps provider is wired.

   The viewBox is sized to the container's actual pixel aspect ratio (measured
   with a ResizeObserver) and drawn 1:1 with preserveAspectRatio="none", so pins
   are never cropped or stretched regardless of how wide/short the box is. */

import { useEffect, useMemo, useRef, useState } from 'react';

export interface MapPoint {
  id: string;
  name: string;
  coords: [number, number];   // [lat, lng]
  inRange?: boolean;          // for coverage colouring
}

interface Props {
  points: MapPoint[];
  selectedId?: string | null;
  userPos?: [number, number] | null;
  onSelect?: (id: string) => void;
  radiusKm?: number;          // draw a coverage ring around `center`
  center?: [number, number];  // coverage centre (defaults to the selected point)
  fitRadiusKm?: number;       // zoom the viewport to ~this many km around `center`
  className?: string;
}

const PAD = 0.14;

export default function BranchMap({ points, selectedId, userPos, onSelect, radiusKm, center, fitRadiusKm, className = '' }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 640, h: 400 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = dims.w, H = dims.h;

  const geo = useMemo(() => {
    const centre = center ?? points.find((p) => p.id === selectedId)?.coords;
    const all: [number, number][] = [...points.map((p) => p.coords)];
    if (userPos) all.push(userPos);
    if (centre) all.push(centre);

    let minLat: number, maxLat: number, minLng: number, maxLng: number;
    if (fitRadiusKm && centre) {
      const degLat = fitRadiusKm / 111;
      const degLng = fitRadiusKm / (111 * Math.cos((centre[0] * Math.PI) / 180));
      minLat = centre[0] - degLat; maxLat = centre[0] + degLat;
      minLng = centre[1] - degLng; maxLng = centre[1] + degLng;
    } else {
      minLat = Math.min(...all.map((c) => c[0]));
      maxLat = Math.max(...all.map((c) => c[0]));
      minLng = Math.min(...all.map((c) => c[1]));
      maxLng = Math.max(...all.map((c) => c[1]));
      if (maxLat - minLat < 0.02) { maxLat += 0.01; minLat -= 0.01; }
      if (maxLng - minLng < 0.02) { maxLng += 0.01; minLng -= 0.01; }
    }

    const padX = PAD * W, padY = PAD * H;
    const proj = ([lat, lng]: [number, number]): [number, number] => {
      const fx = (lng - minLng) / (maxLng - minLng);
      const fy = (lat - minLat) / (maxLat - minLat);
      return [padX + fx * (W - 2 * padX), padY + (1 - fy) * (H - 2 * padY)];
    };

    let ring: { cx: number; cy: number; rx: number; ry: number } | null = null;
    if (radiusKm && centre) {
      const midLat = (minLat + maxLat) / 2;
      const kmPerDegLng = 111 * Math.cos((midLat * Math.PI) / 180);
      const pxPerDegX = (W - 2 * padX) / (maxLng - minLng);
      const pxPerDegY = (H - 2 * padY) / (maxLat - minLat);
      const [cx, cy] = proj(centre);
      ring = { cx, cy, rx: (radiusKm / kmPerDegLng) * pxPerDegX, ry: (radiusKm / 111) * pxPerDegY };
    }

    /* Declustering: real branch coords bunch up (e.g. several in Cairo), so nudge
       overlapping pins apart on screen for readability. Purely visual — distance
       and coverage always use the true coords. The selected pin is anchored so it
       stays centred under its coverage ring. */
    const xy = points.map((p) => proj(p.coords));
    const MIN = Math.min(70, Math.max(44, Math.min(W, H) * 0.17));
    const anchor = points.findIndex((p) => p.id === selectedId);
    for (let it = 0; it < 120; it++) {
      let moved = false;
      for (let i = 0; i < xy.length; i++) {
        for (let j = i + 1; j < xy.length; j++) {
          let dx = xy[j][0] - xy[i][0], dy = xy[j][1] - xy[i][1];
          let d = Math.hypot(dx, dy);
          if (d >= MIN) continue;
          if (d < 0.01) { dx = Math.cos(i * 2.4); dy = Math.sin(i * 2.4); d = 1; }
          const off = (MIN - d) / d;
          if (i === anchor) { xy[j][0] += dx * off; xy[j][1] += dy * off; }
          else if (j === anchor) { xy[i][0] -= dx * off; xy[i][1] -= dy * off; }
          else { xy[i][0] -= dx * off / 2; xy[i][1] -= dy * off / 2; xy[j][0] += dx * off / 2; xy[j][1] += dy * off / 2; }
          moved = true;
        }
      }
      if (!moved) break;
    }
    const clampX = (v: number) => Math.max(PAD * W, Math.min(W - PAD * W, v));
    const clampY = (v: number) => Math.max(PAD * H + 26, Math.min(H - PAD * H, v));

    return {
      pins: points.map((p, i) => ({ ...p, xy: [clampX(xy[i][0]), clampY(xy[i][1])] as [number, number] })),
      user: userPos ? proj(userPos) : null,
      ring,
    };
  }, [points, selectedId, userPos, radiusKm, center, fitRadiusKm, W, H]);

  /* proportional decorative "roads" */
  const road = (pts: [number, number][]) => 'M' + pts.map(([fx, fy]) => `${(fx * W).toFixed(1)} ${(fy * H).toFixed(1)}`).join(' L');

  return (
    <div className={`bmap ${className}`.trim()} ref={wrapRef}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="bmap-svg" role="img" aria-label="Branch locations map">
        <rect x="0" y="0" width={W} height={H} fill="#eef3ec" />
        <g stroke="#dfe7db" strokeWidth="1">
          {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * (W / 8)} y1="0" x2={(i + 1) * (W / 8)} y2={H} />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={(i + 1) * (H / 6)} x2={W} y2={(i + 1) * (H / 6)} />)}
        </g>
        <g stroke="#d3ddcf" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8">
          <path d={road([[-0.03, 0.27], [0.47, 0.41], [1.03, 0.2]])} />
          <path d={road([[0.12, -0.05], [0.31, 0.55], [0.22, 1.05]])} />
          <path d={road([[-0.03, 0.78], [0.56, 0.68], [1.03, 0.82]])} />
        </g>

        {geo.ring && (
          <ellipse cx={geo.ring.cx} cy={geo.ring.cy} rx={geo.ring.rx} ry={geo.ring.ry}
            fill="rgba(221,130,38,0.12)" stroke="var(--orange)" strokeWidth="2" strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
        )}

        {geo.user && (
          <g transform={`translate(${geo.user[0]} ${geo.user[1]})`}>
            <circle r="12" fill="rgba(43,108,176,0.18)" />
            <circle r="5" fill="#2b6cb0" stroke="#fff" strokeWidth="2" />
          </g>
        )}

        {geo.pins.map((p) => {
          const isSel = p.id === selectedId;
          const color = p.inRange === false ? '#9aa0a6' : 'var(--orange)';
          return (
            <g key={p.id} transform={`translate(${p.xy[0]} ${p.xy[1]})`} className="bmap-pin"
              style={{ cursor: onSelect ? 'pointer' : 'default' }}
              onClick={() => onSelect?.(p.id)}>
              <title>{p.name}</title>
              <path d="M0 0 C-9 -12 -14 -18 -14 -26 A14 14 0 1 1 14 -26 C14 -18 9 -12 0 0 Z"
                fill={isSel ? color : '#fff'} stroke={color} strokeWidth={isSel ? 3 : 2.5}
                transform={isSel ? 'scale(1.15)' : 'scale(1)'} />
              <circle cx="0" cy="-26" r="5" fill={isSel ? '#fff' : color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
