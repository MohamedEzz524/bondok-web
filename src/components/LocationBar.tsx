'use client';

/* Shared location bar (menu + offers pages). Reflects the selected branch and
   opens the branch picker. Before a branch is chosen it prompts "Choose a
   Location"; after, it shows the branch name with a Change action. */

import { useBranch } from './branch-context';

export default function LocationBar({ fullBleed = false }: { fullBleed?: boolean }) {
  const { selected, openBranchModal } = useBranch();
  return (
    <div className={`offers-locbar${fullBleed ? ' offers-locbar-bleed' : ''}`}>
      <div className="offers-locbar-inner">
        <button className="loc-bar-btn" onClick={openBranchModal}>
          <p className="offers-loc-title">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
            {selected ? selected.name : 'Choose a Location'}
          </p>
          <p className="offers-loc-sub">{selected ? 'Prices & offers for this branch' : 'For availability and prices'}</p>
        </button>
        <button className="offers-loc-link" onClick={openBranchModal}>{selected ? 'Change' : 'See Branches'}</button>
      </div>
    </div>
  );
}
