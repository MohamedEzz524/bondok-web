'use client';

/* Delivery / Pickup start-order popup (demo). Custom map + geolocation + a real
   branch picker wired to the branch context. Choosing a branch sets it app-wide
   (prices/offers), remembers the fulfilment mode, and heads to the menu.
   Delivery shows each branch's coverage; checkout enforces it. */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUI } from './ui-context';
import { useBranch } from './branch-context';
import { useAuth } from './auth-context';
import { branchSamples, DELIVERY_RADIUS_KM, haversine, coverageOf, nearestBranchId } from '@/lib/branches-sample';
import BranchMap from './BranchMap';
import CloseIcon from './CloseIcon';

export default function OrderModal() {
  const { orderMode, orderClosing, switchOrder, closeOrder, openAuth } = useUI();
  const { branches, selected, selectBranch } = useBranch();
  const { user } = useAuth();
  const router = useRouter();

  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');

  /* Esc closes; lock page scroll while open */
  useEffect(() => {
    if (!orderMode) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOrder(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [orderMode, closeOrder]);

  const isDelivery = orderMode === 'delivery';
  const selCoords = selected ? branchSamples[selected.id].coords : undefined;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches
      .filter((b) => !q || b.name.toLowerCase().includes(q) || b.area.toLowerCase().includes(q))
      .map((b) => {
        const cov = pos ? coverageOf(pos, b.id) : null;
        return { branch: b, km: cov?.km ?? null, inRange: cov?.inRange ?? null };
      })
      .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
  }, [branches, query, pos]);

  const mapPoints = branches.map((b) => ({
    id: b.id, name: b.name, coords: branchSamples[b.id].coords,
    inRange: isDelivery && pos ? coverageOf(pos, b.id).inRange : undefined,
  }));

  if (!orderMode) return null;

  const useLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setNote('Location isn’t available on this device — pick a branch below.'); return; }
    setLocating(true); setNote('');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const here: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(here); setLocating(false);
        selectBranch(nearestBranchId(here));   // your nearest branch (always deliverable in the demo)
        setNote('Nearest branches to you, closest first:');
      },
      () => { setLocating(false); setNote('Couldn’t get your location — pick a branch below.'); },
      { timeout: 8000 },
    );
  };

  const coverageBad = isDelivery && pos && selected ? !coverageOf(pos, selected.id).inRange : false;
  /* ring wide enough to visually include the located user */
  const effRadius = pos && selCoords ? Math.max(DELIVERY_RADIUS_KM, haversine(pos, selCoords) * 1.12) : DELIVERY_RADIUS_KM;

  const start = () => {
    if (!selected) return;
    try { localStorage.setItem('bondok-fulfillment-v1', orderMode); } catch { /* blocked */ }
    closeOrder();
    router.push('/menu');
  };

  return (
    <div className={`omodal-overlay${orderClosing ? ' closing' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeOrder(); }}>
      <div className="omodal" role="dialog" aria-label="Order" data-mode={orderMode}>
        <button className="omodal-close" aria-label="Close" onClick={closeOrder}><CloseIcon size={18} /></button>

        <header className="omodal-head">
          <div className="omodal-title">
            {orderMode === 'pickup' ? (
              <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M5 4h14l-1 4H6zm1.2 6h11.6l-1.4 10H7.6zM9 2h6v1.5H9z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="26" height="26"><path fill="currentColor" d="M19 7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM8 11h5l2.5 3H18l3 6h-2.2l-2.3-4.5H12l-2.7-3.2L8 13.5V11zM4 13h3v1.5H4zM2 16h4v1.5H2zM4 19h3v1.5H4z" /></svg>
            )}
            <h2>{orderMode === 'pickup' ? 'Pick Up' : 'Delivery'}</h2>
          </div>
          <button className="omodal-switch" onClick={switchOrder}>
            {orderMode === 'pickup' ? 'Switch to Delivery' : 'Switch to Pickup'}
          </button>
        </header>

        <div className="omodal-body">
          <div className="omodal-search">
            <input type="text" placeholder="Search area or branch name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search branches" />
            <button className="omodal-searchbtn" aria-label="Search">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" /></svg>
            </button>
          </div>

          <BranchMap
            className="omodal-map"
            points={mapPoints}
            selectedId={selected?.id}
            userPos={pos}
            onSelect={selectBranch}
            radiusKm={isDelivery && selected ? effRadius : undefined}
            center={selCoords}
            fitRadiusKm={isDelivery && selected && pos ? effRadius * 1.5 : undefined}
          />

          <button className="btn btn-outline omodal-locate" onClick={useLocation} disabled={locating}>
            <img src="/icons/Icon-location.svg" alt="" width="16" height="16" />
            {locating ? 'Locating…' : pos ? 'Re-check my location' : 'Use my location'}
          </button>
          {note && <p className="omodal-note-sm">{note}</p>}
          {coverageBad && <p className="omodal-warn">⚠ You’re outside {selected!.name}’s delivery area — pick an in-range branch below or switch to pickup.</p>}

          {isDelivery && user && (
            <p className="omodal-saved">Signed in as +20 {user.phone} — saved addresses connect with the loyalty backend.</p>
          )}
          {isDelivery && !user && (
            <p className="omodal-saved">Have saved addresses? <button className="omodal-signin-link" onClick={() => { closeOrder(); openAuth(); }}>Sign in</button>.</p>
          )}

          <ul className="omodal-list">
            {rows.map(({ branch, km, inRange }) => (
              <li key={branch.id}>
                <button
                  className={`omodal-branch${selected?.id === branch.id ? ' is-on' : ''}`}
                  onClick={() => selectBranch(branch.id)}
                >
                  <span className="omodal-branch-main">
                    <span className="omodal-branch-name">{branch.name}</span>
                    <span className="omodal-branch-area">{branch.area}{km != null ? ` · ${km.toFixed(1)} km` : ''}</span>
                  </span>
                  {isDelivery && inRange === true && <span className="omodal-tag omodal-tag-ok">Delivers</span>}
                  {isDelivery && inRange === false && <span className="omodal-tag omodal-tag-far">Pickup only</span>}
                  {selected?.id === branch.id && <span className="omodal-tick" aria-hidden="true">✓</span>}
                </button>
              </li>
            ))}
          </ul>

          <p className="omodal-note">
            Prices and item availability may vary per branch.{' '}
            <Link href="/delivery-terms" onClick={closeOrder}>Delivery terms and fees apply.</Link>
          </p>
        </div>

        <footer className="omodal-foot">
          <button className="btn btn-solid omodal-cta" onClick={start} disabled={!selected}>
            {selected ? `${orderMode === 'pickup' ? 'Pick up' : 'Order'} from ${selected.name} — Browse menu` : 'Choose a branch to continue'}
            {selected && <svg viewBox="0 0 54 54" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M40.4 29.8H0v-6.6h40.4L21.8 4.6 26.5 0l26.6 26.5-26.6 26.5-4.7-4.6 18.6-18.6z" /></svg>}
          </button>
        </footer>
      </div>
    </div>
  );
}
