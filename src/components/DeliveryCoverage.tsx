'use client';

/* Checkout branch picker. The customer chooses a governorate + city; we surface
   the Bondok branches that deliver there and let them pick one (no branch is
   pre-selected — the choice is theirs). The map shows a pin for every branch
   currently listed; tapping a pin selects it. There is no pin-drop or coverage
   ring: the exact drop point is collected later over WhatsApp.

   "Use my location" snaps the governorate/city to the nearest branch, selects
   it, tags it "Nearest", and shows distances; beyond all coverage it blocks
   until a covered area is picked. Reports readiness up so checkout can gate. */

import { useEffect, useMemo, useState } from 'react';
import { useBranch } from './branch-context';
import { branches, GOVERNORATES, citiesIn, branchesIn } from '@/lib/branches';
import { branchSamples, haversine, nearestBranchId } from '@/lib/branches-sample';
import BranchMap from './BranchMap';
import Select from './Select';

/* max distance (km) from the nearest branch we still treat as "covered" when
   auto-detecting via geolocation. PLACEHOLDER until real coverage lands. */
const COVER_KM = 45;

interface Props {
  governorate: string;
  city: string;
  onArea: (governorate: string, city: string) => void;
  onStatus?: (ok: boolean | null) => void;
}

export default function DeliveryCoverage({ governorate, city, onArea, onStatus }: Props) {
  const { selected, selectBranch } = useBranch();
  const [pos, setPos] = useState<[number, number] | null>(null);   // user location (once "use my location")
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');
  const [blocked, setBlocked] = useState(false);                   // geolocated outside all coverage

  /* branches serving the chosen city, with distance once located, nearest first */
  const list = useMemo(() => {
    const base = branchesIn(governorate, city);
    const withKm = base.map((b) => ({ branch: b, km: pos ? haversine(pos, branchSamples[b.id].coords) : null }));
    if (pos) withKm.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    return withKm;
  }, [governorate, city, pos]);

  const nearestId = pos && list.length ? list[0].branch.id : null;
  const chosenValid = !!selected && list.some((r) => r.branch.id === selected.id);

  useEffect(() => {
    onStatus?.(blocked ? false : (chosenValid ? true : null));
  }, [blocked, chosenValid, onStatus]);

  const pickArea = (g: string, c: string) => { setBlocked(false); setNote(''); onArea(g, c); };

  const useLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setNote('Location isn’t available on this device.'); return; }
    setLocating(true); setNote('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        const coords: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(coords);
        const nid = nearestBranchId(coords);
        const km = haversine(coords, branchSamples[nid].coords);
        const branch = branches.find((b) => b.id === nid) ?? null;
        if (km > COVER_KM || !branch) {
          setBlocked(true);
          onStatus?.(false);
          setNote('No Bondok branch delivers to your area yet — choose a covered governorate and city to continue.');
          return;
        }
        setBlocked(false);
        onArea(branch.governorate, branch.city);
        selectBranch(branch.id);
        setNote(`Nearest branch: ${branch.name} · ${km.toFixed(1)} km away.`);
      },
      () => { setLocating(false); setNote('Couldn’t get your location — pick your governorate and city instead.'); },
      { timeout: 8000 },
    );
  };

  const mapPoints = list.map((r) => ({ id: r.branch.id, name: r.branch.name, coords: branchSamples[r.branch.id].coords }));

  return (
    <div className="cov">
      <div className="cov-intro">
        <p className="cov-intro-title">
          <span className="cov-intro-pin" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
          </span>
          Choose your delivery branch
        </p>
        <p className="cov-intro-text">Pick your governorate and city — we’ll show the Bondok branches that deliver there. Your exact address is confirmed over WhatsApp after you order.</p>
      </div>

      <div className="cov-selects">
        <div className="ct-field">
          <label className="ct-label">Governorate <span className="ct-req">*</span></label>
          <Select
            ariaLabel="Governorate"
            value={governorate}
            onChange={(g) => pickArea(g, citiesIn(g)[0])}
            options={GOVERNORATES.map((g) => ({ value: g, label: g }))}
          />
        </div>
        <div className="ct-field">
          <label className="ct-label">City / Area <span className="ct-req">*</span></label>
          <Select
            ariaLabel="City"
            value={city}
            onChange={(c) => pickArea(governorate, c)}
            options={citiesIn(governorate).map((c) => ({ value: c, label: c }))}
          />
        </div>
      </div>

      <button type="button" className="cov-loc" onClick={useLocation} disabled={locating}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" /></svg>
        {locating ? 'Locating…' : 'Use my location'}
      </button>
      {note && <p className="cov-note">{note}</p>}

      {blocked ? (
        <p className="cov-warn cov-blocked">⚠ No Bondok branch covers your area yet. Choose a covered governorate and city above to continue.</p>
      ) : (
        <>
          <div className="cov-branches" role="radiogroup" aria-label="Delivery branch">
            {list.map(({ branch: b, km }) => {
              const on = selected?.id === b.id;
              const isNearest = b.id === nearestId;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={`cov-branch${on ? ' is-on' : ''}`}
                  onClick={() => selectBranch(b.id)}
                >
                  <span className="cov-branch-radio" aria-hidden="true">{on && <span />}</span>
                  <span className="cov-branch-main">
                    <strong>{b.name}</strong>
                    <span>{branchSamples[b.id].address}{km != null ? ` · ${km.toFixed(1)} km away` : ''}</span>
                  </span>
                  {isNearest && <span className="cov-branch-tag">Nearest</span>}
                </button>
              );
            })}
          </div>

          {list.length > 0 && (
            <BranchMap
              className="cov-map"
              points={mapPoints}
              selectedId={selected?.id}
              userPos={pos}
              onSelect={selectBranch}
            />
          )}
        </>
      )}
    </div>
  );
}
