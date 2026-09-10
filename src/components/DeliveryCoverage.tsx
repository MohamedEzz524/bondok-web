'use client';

/* Checkout delivery-coverage check: shows the selected branch + its coverage
   ring on the custom map, lets the user drop their location, and validates it
   against DELIVERY_RADIUS_KM. Out of range -> suggests in-range branches to
   switch to (or pickup). Reports status up so checkout can gate submission. */

import { useEffect, useState } from 'react';
import { useBranch } from './branch-context';
import { branchSamples, DELIVERY_RADIUS_KM, haversine, coverageOf } from '@/lib/branches-sample';
import BranchMap from './BranchMap';

export default function DeliveryCoverage({ onStatus }: { onStatus?: (inRange: boolean | null) => void }) {
  const { selected, branches, selectBranch, recommend } = useBranch();
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');

  const selCoords = selected ? branchSamples[selected.id].coords : undefined;
  const cov = pos && selected ? coverageOf(pos, selected.id) : null;
  const km = cov?.km ?? null;
  const inRange = cov ? cov.inRange : null;
  const effRadius = pos && selCoords ? Math.max(DELIVERY_RADIUS_KM, haversine(pos, selCoords) * 1.12) : DELIVERY_RADIUS_KM;

  useEffect(() => { onStatus?.(inRange); }, [inRange, onStatus]);
  /* recheck against a newly-selected branch */
  useEffect(() => { setPos((p) => p); }, [selected?.id]);

  if (!selected) {
    return <div className="cov cov-nobranch"><p>Choose your branch above to check delivery coverage.</p></div>;
  }

  const points = branches.map((b) => ({
    id: b.id, name: b.name, coords: branchSamples[b.id].coords,
    inRange: pos ? coverageOf(pos, b.id).inRange : undefined,
  }));
  const nearest = pos ? recommend(pos).filter((r) => r.inRange && r.branch.id !== selected.id).slice(0, 3) : [];

  const useLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setNote('Location isn’t available on this device.'); return; }
    setLocating(true); setNote('');
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setLocating(false); },
      () => { setLocating(false); setNote('Couldn’t get your location — you can still order.'); },
      { timeout: 8000 },
    );
  };

  return (
    <div className="cov">
      <BranchMap
        className="cov-map"
        points={points}
        selectedId={selected.id}
        userPos={pos}
        radiusKm={effRadius}
        center={selCoords}
        fitRadiusKm={pos ? effRadius * 1.5 : DELIVERY_RADIUS_KM * 1.7}
        onSelect={selectBranch}
      />
      <div className="cov-body">
        <button type="button" className="btn btn-outline cov-loc" onClick={useLocation} disabled={locating}>
          {locating ? 'Locating…' : pos ? 'Re-check my location' : 'Use my location to check coverage'}
        </button>
        {note && <p className="cov-note">{note}</p>}
        {inRange === true && (
          <p className="cov-ok">✓ {selected.name} delivers to your location ({km!.toFixed(1)} km away).</p>
        )}
        {inRange === false && (
          <div className="cov-out">
            <p className="cov-warn">⚠ You’re outside {selected.name}’s delivery area ({km!.toFixed(1)} km).</p>
            {nearest.length > 0 ? (
              <>
                <p className="cov-switch-label">Switch to a branch that delivers to you:</p>
                <div className="cov-switch">
                  {nearest.map((r) => (
                    <button key={r.branch.id} type="button" className="cov-switch-btn" onClick={() => selectBranch(r.branch.id)}>
                      {r.branch.name} · {r.km.toFixed(1)} km
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="cov-switch-label">Sorry — no branch covers this spot for delivery. Try pickup instead.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
