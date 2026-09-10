'use client';

/* Custom-drawn (SVG) map placeholder — projects branch lat/lng onto a stylised
   canvas with pins, an optional delivery-coverage ring, and a "you" marker.
   Not a real tile map; a believable stand-in until a maps provider is wired.
   Branch coords come from branchSamples (see menu-data / branches-sample). */

import { useMemo } from 'react';

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

const W = 640;
const H = 440;
const PAD = 0.13;

export default function BranchMap({ points, selectedId, userPos, onSelect, radiusKm, center, fitRadiusKm, className = '' }: Props) {
  const geo = useMemo(() => {
    const centre = center ?? points.find((p) => p.id === selectedId)?.coords;
    const all: [number, number][] = [...points.map((p) => p.coords)];
    if (userPos) all.push(userPos);
    if (centre) all.push(centre);

    let minLat: number, maxLat: number, minLng: number, maxLng: number;
    if (fitRadiusKm && centre) {
      /* zoom the viewport to ~fitRadiusKm around the centre so a coverage ring fits */
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

    const proj = ([lat, lng]: [number, number]): [number, number] => {
      const fx = (lng - minLng) / (maxLng - minLng);
      const fy = (lat - minLat) / (maxLat - minLat);
      return [(PAD + fx * (1 - 2 * PAD)) * W, (PAD + (1 - fy) * (1 - 2 * PAD)) * H];
    };

    let ring: { cx: number; cy: number; rx: number; ry: number } | null = null;
    if (radiusKm && centre) {
      const midLat = (minLat + maxLat) / 2;
      const kmPerDegLng = 111 * Math.cos((midLat * Math.PI) / 180);
      const pxPerDegX = ((1 - 2 * PAD) * W) / (maxLng - minLng);
      const pxPerDegY = ((1 - 2 * PAD) * H) / (maxLat - minLat);
      const [cx, cy] = proj(centre);
      ring = { cx, cy, rx: (radiusKm / kmPerDegLng) * pxPerDegX, ry: (radiusKm / 111) * pxPerDegY };
    }

    return {
      pins: points.map((p) => ({ ...p, xy: proj(p.coords) })),
      user: userPos ? proj(userPos) : null,
      ring,
    };
  }, [points, selectedId, userPos, radiusKm, center]);

  return (
    <div className={`bmap ${className}`.trim()}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="bmap-svg" role="img" aria-label="Branch locations map">
        {/* stylised backdrop */}
        <rect x="0" y="0" width={W} height={H} fill="#eef3ec" />
        <g stroke="#dfe7db" strokeWidth="1">
          {Array.from({ length: 7 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * (W / 8)} y1="0" x2={(i + 1) * (W / 8)} y2={H} />)}
          {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="0" y1={(i + 1) * (H / 6)} x2={W} y2={(i + 1) * (H / 6)} />)}
        </g>
        {/* faint "roads" */}
        <g stroke="#d3ddcf" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.8">
          <path d="M-20 120 L300 180 L680 90" />
          <path d="M80 -20 L200 240 L140 460" />
          <path d="M-20 340 L360 300 L680 360" />
        </g>

        {/* coverage ring */}
        {geo.ring && (
          <ellipse cx={geo.ring.cx} cy={geo.ring.cy} rx={geo.ring.rx} ry={geo.ring.ry}
            fill="rgba(221,130,38,0.12)" stroke="var(--orange)" strokeWidth="2" strokeDasharray="6 5" />
        )}

        {/* user marker */}
        {geo.user && (
          <g transform={`translate(${geo.user[0]} ${geo.user[1]})`}>
            <circle r="12" fill="rgba(43,108,176,0.18)" />
            <circle r="5" fill="#2b6cb0" stroke="#fff" strokeWidth="2" />
          </g>
        )}

        {/* branch pins */}
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
