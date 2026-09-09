'use client';

/* Branches page - built to the designer's approved layout.
   Display data (status, distances, kitchen pace) is sample until client
   branch data / Cloud-Kitchen API arrives; the live map needs coordinates. */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { branches } from '@/lib/branches';
import { branchSamples, BRANCH_FILTERS } from '@/lib/branches-sample';

/* great-circle distance in km between [lat, lng] pairs */
function haversine([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const q =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
}

const layoutSpring = { layout: { duration: 0.3, ease: 'easeOut' as const } };

export default function BranchesView() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(branches[0].id);
  const [locStatus, setLocStatus] = useState('');
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [sortKey, setSortKey] = useState<'near' | 'az'>('near');
  const [sortOpen, setSortOpen] = useState(false);

  const km = (id: string) => (userPos ? haversine(userPos, branchSamples[id].coords) : null);
  const distLabel = (id: string) => {
    const d = km(id);
    if (d == null) return branchSamples[id].distance;
    return d < 100 ? `${d.toFixed(1)} km` : `${Math.round(d)} km`;
  };

  const list = branches
    .filter((b) => {
      const s = branchSamples[b.id];
      const q = query.trim().toLowerCase();
      const matchQ = !q || b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q) || s.address.toLowerCase().includes(q);
      const matchF = filter === 'all' || s.features.includes(filter);
      return matchQ && matchF;
    })
    .sort((a, b) => (sortKey === 'az' ? a.name.localeCompare(b.name) : userPos ? km(a.id)! - km(b.id)! : 0));

  const selected = list.find((b) => b.id === selectedId) ?? list[0];

  const useLocation = () => {
    if (!navigator.geolocation) { setLocStatus('Location is not available in this browser.'); return; }
    setLocStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(here);
        const nearest = [...branches].sort(
          (a, b) => haversine(here, branchSamples[a.id].coords) - haversine(here, branchSamples[b.id].coords),
        )[0];
        setSelectedId(nearest.id);
        setLocStatus(`Nearest branch selected: ${nearest.name} (~${haversine(here, branchSamples[nearest.id].coords).toFixed(1)} km away).`);
      },
      () => setLocStatus('Location permission denied - you can still search by area name.'),
    );
  };

  return (
    <div className="br-page">
      {/* hero */}
      <header className="br-hero">
        <p className="pg-eyebrow"><span className="pg-dot" aria-hidden="true" />Locations &amp; pickup</p>
        <h1>Find your nearest<br />Bondok</h1>
        <p className="br-sub">{branches.length} locations and growing - find the Bondok nearest to you.</p>
      </header>

      {/* search bar: input + sort + locate in one container */}
      <div className="br-searchbar">
        <label className="br-search">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Icon-search.svg" alt="" width="19" height="19" />
          <input
            placeholder="Search by area, street, or branch name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search branches"
          />
        </label>
        <div className="br-sortwrap">
          <button className="br-sortbtn" aria-haspopup="listbox" aria-expanded={sortOpen} onClick={() => setSortOpen(!sortOpen)}>
            <span>Sort by:</span> {sortKey === 'near' ? 'Near' : 'A-Z'}
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
          </button>
          {sortOpen && (
            <div className="rv-sort-menu" role="listbox">
              {([['near', 'Nearest first'], ['az', 'Name (A-Z)']] as const).map(([k, label]) => (
                <button key={k} role="option" aria-selected={sortKey === k} className={sortKey === k ? 'is-active' : ''} onClick={() => { setSortKey(k); setSortOpen(false); }}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="btn btn-solid br-locate" onClick={useLocation}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-current-location.svg" alt="" width="17" height="17" />
          Use Current Location
        </button>
      </div>
      {locStatus && <p className="br-loc-status" role="status">{locStatus}</p>}

      {/* filter pills */}
      <div className="br-filters">
        {BRANCH_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`br-filter${filter === f.key ? ' is-active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* list + map */}
      <div className="br-layout">
        <div className="br-list">
          <div className="br-list-head">
            <p className="br-count"><strong>{list.length} Locations</strong> <span>{query.trim() ? `near "${query.trim()}"` : 'across Egypt'}</span></p>

          </div>

          {list.length === 0 && (
            <p className="br-none">No branches match - try a different area or filter.</p>
          )}

          {list.map((b) => {
            const s = branchSamples[b.id];
            const isSel = selected && b.id === selected.id;
            if (isSel) {
              return (
                <motion.article
                  layout
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...layoutSpring, duration: 0.26, ease: 'easeOut' }}
                  className="br-card br-card-selected"
                >
                  <div className="br-sel-top">
                    <span className="br-sel-pill"><span className="br-sel-dot" aria-hidden="true" />Selected kitchen</span>
                  </div>
                  <h3>{b.name}</h3>
                  <p className="br-addr">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
                    {s.address}
                  </p>
                  <div className="br-panel">
                    <div className="br-panel-row">
                      <div>
                        <p className="br-open"><span className="br-dot-on" aria-hidden="true" />{s.status}</p>
                        <p className="br-muted">{s.closes}</p>
                      </div>
                      <div className="br-panel-right">
                        <p className="br-dist">{distLabel(b.id)}</p>
                        {s.walk && <p className="br-muted">{s.walk}</p>}
                      </div>
                    </div>
                    <div className="br-panel-row br-pace-row">
                      <p className="br-pace">⚡ Live Kitchen Pace: <strong>{s.pace}</strong></p>
                      <p className="br-wait">{s.wait}</p>
                    </div>
                    <span className="br-bar"><span style={{ width: `${s.pacePct}%` }} /></span>
                  </div>
                  <div className="br-actions">
                    <Link href="/menu" className="btn btn-solid br-order">
                      Order Now
                      <svg viewBox="0 0 54 54" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>
                    </Link>
                    <button className="br-round" title="Directions arrive with branch map links" aria-label="Directions">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/Icon-direction.svg" alt="" width="18" />
                    </button>
                    <button className="br-round" title="Hotline numbers pending from client" aria-label="Call branch">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/Icon-phone.svg" alt="" width="15" height="15" />
                    </button>
                  </div>
                </motion.article>
              );
            }
            return (
              <motion.button layout transition={layoutSpring} key={b.id} className="br-card br-card-compact" onClick={() => setSelectedId(b.id)}>
                <span className="br-compact-head">
                  <h4>{b.name}</h4>
                  <span className="br-dist-chip">{distLabel(b.id)}</span>
                  <svg className="br-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" /></svg>
                </span>
                <span className="br-compact-addr">{s.address}</span>
                <span className="br-panel br-compact-panel">
                  <span className="br-open"><span className="br-dot-on" aria-hidden="true" />{s.status}</span>
                  <span className="br-compact-note">{s.note}</span>
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* map placeholder (live map arrives with branch coordinates) */}
        <div className="br-map" role="img" aria-label="Branches map placeholder">
          <label className="br-map-follow">
            <input type="checkbox" defaultChecked />
            Search this area as map moves
          </label>
          <div className="br-map-controls" aria-hidden="true">
            <button className="br-map-btn">+</button>
            <button className="br-map-btn">−</button>
            <button className="br-map-btn br-map-btn-round">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--orange)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path strokeLinejoin="round" d="m15 9-2 5-4 1 2-5 4-1z" /></svg>
            </button>
            <button className="br-map-btn br-map-btn-round">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--orange)" strokeWidth="1.8"><path strokeLinejoin="round" d="m12 3 9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></svg>
            </button>
          </div>
          <p className="br-map-pending">Live map connects once branch locations arrive</p>
          <div className="br-map-legend" aria-hidden="true">
            <span><span className="br-legend-dot" />Bondok Store</span>
            <span><span className="br-legend-dot br-legend-dot2" />Open Late</span>
            <span className="br-legend-mute">Live Traffic: Smooth</span>
          </div>
          <button className="br-map-expand" title="Full map arrives with branch coordinates">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5" /></svg>
            Expand Map
          </button>
        </div>
      </div>

      <p className="br-sample-note">
        Branch details shown are samples - real addresses, hours, and live status connect from
        the branch data / Cloud-Kitchen API.
      </p>
    </div>
  );
}
