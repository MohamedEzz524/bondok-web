'use client';

/* First-visit / on-demand branch picker. Optional geolocation recommends the
   nearest branches (closest first) - never forces one. Skipping leaves prices
   hidden and the location bar on "Choose Location". */

import { useState } from 'react';
import { useBranch } from './branch-context';
import { prefetchBranchCatalog } from '@/lib/branch-catalog';
import Modal from './Modal';
import CloseIcon from './CloseIcon';

export default function BranchModal() {
  const { branches, selected, modalOpen, closeBranchModal, selectBranch, recommend } = useBranch();
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState('');

  const useLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setNote('Location isn’t available on this device — pick a branch below.');
      return;
    }
    setLocating(true); setNote('');
    navigator.geolocation.getCurrentPosition(
      (p) => { setPos([p.coords.latitude, p.coords.longitude]); setLocating(false); },
      () => { setLocating(false); setNote('Couldn’t get your location — pick a branch below.'); },
      { timeout: 8000 },
    );
  };

  const list = pos
    ? recommend(pos)
    : branches.map((branch) => ({ branch, km: null as number | null, inRange: null as boolean | null }));

  /* headline once located: does any branch actually deliver to the user? */
  const locatedNote = pos
    ? list.some((i) => i.inRange)
      ? 'Branches that deliver to you, closest first:'
      : 'You’re outside our delivery areas — nearest branches for pickup:'
    : note;

  return (
    <Modal open={modalOpen} onClose={closeBranchModal} label="Choose your branch" overlayClass="branch-overlay" panelClass="branch-modal">
      <div className="branch-head">
        <h2>{selected ? 'Change your branch' : 'Choose your branch'}</h2>
        <button className="branch-close" aria-label="Close" onClick={closeBranchModal}><CloseIcon size={18} /></button>
      </div>
      <p className="branch-sub">Prices, offers and availability depend on your branch — pick one to see live prices, or skip and choose later.</p>

      <button className="btn btn-outline branch-locate" onClick={useLocation} disabled={locating}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
        {locating ? 'Locating…' : 'Use my location'}
      </button>
      {locatedNote && <p className="branch-note">{locatedNote}</p>}

      <ul className="branch-list">
        {list.map(({ branch, km, inRange }) => (
          <li key={branch.id}>
            <button
              className={`branch-item${selected?.id === branch.id ? ' is-on' : ''}${inRange === false ? ' is-far' : ''}`}
              onClick={() => selectBranch(branch.id)}
              onMouseEnter={() => prefetchBranchCatalog(branch.id)}
              onFocus={() => prefetchBranchCatalog(branch.id)}
            >
              <span className="branch-item-pin" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" /></svg>
              </span>
              <span className="branch-item-main">
                <span className="branch-item-name">
                  {branch.name}
                  {inRange === true && <span className="branch-tag branch-tag-near">Delivers to you</span>}
                  {inRange === false && <span className="branch-tag branch-tag-far">Pickup only</span>}
                </span>
                <span className="branch-item-area">{branch.area}{km != null ? ` · ${km.toFixed(1)} km` : ''}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button className="branch-skip" onClick={closeBranchModal}>Skip for now</button>
    </Modal>
  );
}
