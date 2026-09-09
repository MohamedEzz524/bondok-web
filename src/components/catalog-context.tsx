'use client';

/* Branch-aware pricing/availability, delivered reactively to the whole app.
   Reads the active branch from <BranchProvider>, loads that branch's catalog
   (branch-catalog.ts), and exposes price/availability lookups. Switching branch
   swaps the catalog optimistically: an already-cached branch shows instantly;
   an uncached one keeps the previous prices on screen until it resolves (no
   blank flash, no full-page spinner). With no branch selected, prices are
   undefined — the UI renders its "choose a branch" state. */

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useBranch } from './branch-context';
import { menuCategories, type MenuCategory } from '@/lib/menu-data';
import {
  type BranchCatalog,
  getCachedCatalog,
  loadBranchCatalog,
} from '@/lib/branch-catalog';

interface CatalogState {
  branchId: string | null;
  ready: boolean;                                   // a branch is selected AND its catalog is loaded
  priceOf: (slug: string) => number | undefined;    // undefined = no branch / not priced / unavailable-source
  available: (slug: string) => boolean;             // false only when the branch explicitly marks it sold out
}

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { selected } = useBranch();
  const id = selected?.id ?? null;
  const idRef = useRef(id);
  idRef.current = id;

  const [catalog, setCatalog] = useState<BranchCatalog | null>(() => getCachedCatalog(id));

  useEffect(() => {
    if (!id) { setCatalog(null); return; }         // branch cleared -> prices blank
    const cached = getCachedCatalog(id);
    if (cached) { setCatalog(cached); return; }     // instant swap, no flash

    let alive = true;
    loadBranchCatalog(id).then((c) => {
      /* ignore a resolve that lost the race to a newer branch selection */
      if (alive && idRef.current === c.branchId) setCatalog(c);
    });
    return () => { alive = false; };
  }, [id]);

  const value = useMemo<CatalogState>(() => {
    const prices = catalog?.prices ?? {};
    const unavailable = new Set(catalog?.unavailable ?? []);
    return {
      branchId: id,
      ready: !!id && !!catalog,
      priceOf: (slug) => (unavailable.has(slug) ? undefined : prices[slug]),
      available: (slug) => !unavailable.has(slug),
    };
  }, [catalog, id]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside <CatalogProvider>');
  return ctx;
}

/* menu structure (static, from build) overlaid with the active branch's prices.
   Same MenuCategory[] shape consumers already use — price is undefined until a
   branch is chosen, which every price-rendering component already handles. */
export function usePricedCategories(base: MenuCategory[] = menuCategories): MenuCategory[] {
  const { priceOf } = useCatalog();
  return useMemo(
    () => base.map((c) => ({ ...c, products: c.products.map((p) => ({ ...p, price: priceOf(p.slug) })) })),
    [base, priceOf],
  );
}
