'use client';

/* Branch selection - drives per-branch prices/offers/menu availability and the
   shared location bar. Persists to localStorage; a ?branch= query (used by UTM
   ad campaigns) force-selects a branch on load and is stripped once the user
   changes branch manually. Per-branch data itself arrives from the cloud-kitchen
   API - this only manages *which* branch is active. See memory: bondok-branch-selection. */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { branches, type Branch } from '@/lib/branches';
import { branchSamples, DELIVERY_RADIUS_KM } from '@/lib/branches-sample';

const STORAGE_KEY = 'bondok-branch-v1';
const QUERY_KEY = 'branch';

function haversine([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface BranchState {
  branches: Branch[];
  selected: Branch | null;
  ready: boolean;                                  // hydration done (avoid SSR flash)
  modalOpen: boolean;
  selectBranch: (id: string, fromQuery?: boolean) => void;
  clearBranch: () => void;
  openBranchModal: () => void;
  closeBranchModal: () => void;
  recommend: (coords: [number, number]) => { branch: Branch; km: number; inRange: boolean }[];
}

const BranchContext = createContext<BranchState | null>(null);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<Branch | null>(null);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  /* strip ?branch= from the URL without a navigation */
  const stripQuery = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has(QUERY_KEY)) {
        url.searchParams.delete(QUERY_KEY);
        window.history.replaceState(null, '', url.toString());
      }
    } catch { /* noop */ }
  }, []);

  const selectBranch = useCallback((id: string, fromQuery = false) => {
    const b = branches.find((x) => x.id === id);
    if (!b) return;
    setSelected(b);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* blocked */ }
    setModalOpen(false);
    /* a manual change removes the campaign-forced query */
    if (!fromQuery) stripQuery();
  }, [stripQuery]);

  const clearBranch = useCallback(() => {
    setSelected(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* blocked */ }
  }, []);

  /* on mount: a ?branch= query wins (campaign links); else restore saved branch.
     First-time visitors with neither get the popup. */
  useEffect(() => {
    let fromQuery = false;
    try {
      const q = new URL(window.location.href).searchParams.get(QUERY_KEY);
      if (q && branches.some((b) => b.id === q)) { selectBranch(q, true); fromQuery = true; }
    } catch { /* noop */ }
    if (!fromQuery) {
      let saved: string | null = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch { /* blocked */ }
      if (saved && branches.some((b) => b.id === saved)) setSelected(branches.find((b) => b.id === saved)!);
      else setModalOpen(true);   // first visit -> ask
    }
    setReady(true);
  }, [selectBranch]);

  const recommend = useCallback((coords: [number, number]) =>
    branches
      .map((branch) => {
        const km = haversine(coords, branchSamples[branch.id].coords);
        return { branch, km, inRange: km <= DELIVERY_RADIUS_KM };
      })
      .sort((a, b) => a.km - b.km),
  []);

  return (
    <BranchContext.Provider value={{
      branches, selected, ready, modalOpen,
      selectBranch, clearBranch,
      openBranchModal: () => setModalOpen(true),
      closeBranchModal: () => setModalOpen(false),
      recommend,
    }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch(): BranchState {
  const ctx = useContext(BranchContext);
  if (!ctx) throw new Error('useBranch must be used inside <BranchProvider>');
  return ctx;
}
