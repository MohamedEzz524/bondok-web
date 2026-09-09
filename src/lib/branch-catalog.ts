/* Per-branch price / availability catalog — the data layer behind branch-aware
   pricing. See memory: bondok-branch-selection, bondok-cloudkitchen-integration.

   WHY dynamic import(): each branch file is code-split into its own small chunk,
   loaded only when that branch is selected (and prefetchable), so switching
   branch never blocks on the network and never touches the Cloud-Kitchen API on
   the hot path. On the static GitHub Pages build this also sidesteps basePath
   rewriting entirely. When the Cloud-Kitchen API (Foodics/Matrix) lands, swap
   the loader body for a fetch() with stale-while-revalidate — nothing else in
   the app changes, because the shape stays identical. */

export interface BranchCatalog {
  branchId: string;
  prices: Record<string, number>;   // product slug -> base unit price (EGP)
  unavailable: string[];            // slugs sold out at this branch
  updatedAt: string;
}

type RawCatalog = { branchId?: string; prices?: Record<string, number>; unavailable?: string[]; updatedAt?: string };

/* registry keyed by branch id — kept in sync with src/lib/branches.ts */
const loaders: Record<string, () => Promise<{ default: RawCatalog }>> = {
  b01: () => import('@/data/branches/b01.json'),
  b02: () => import('@/data/branches/b02.json'),
  b03: () => import('@/data/branches/b03.json'),
  b04: () => import('@/data/branches/b04.json'),
  b05: () => import('@/data/branches/b05.json'),
  b06: () => import('@/data/branches/b06.json'),
  b07: () => import('@/data/branches/b07.json'),
  b08: () => import('@/data/branches/b08.json'),
  b09: () => import('@/data/branches/b09.json'),
  b10: () => import('@/data/branches/b10.json'),
  b11: () => import('@/data/branches/b11.json'),
};

const cache = new Map<string, BranchCatalog>();
const inflight = new Map<string, Promise<BranchCatalog>>();

const emptyCatalog = (id: string): BranchCatalog => ({ branchId: id, prices: {}, unavailable: [], updatedAt: '' });

function normalize(id: string, raw: RawCatalog): BranchCatalog {
  return {
    branchId: id,
    prices: raw.prices ?? {},
    unavailable: raw.unavailable ?? [],
    updatedAt: raw.updatedAt ?? '',
  };
}

/* synchronous cache peek — lets the UI swap instantly when data is already in
   memory (no loading flash on a re-selected branch). */
export function getCachedCatalog(id: string | null): BranchCatalog | null {
  return id ? cache.get(id) ?? null : null;
}

export function loadBranchCatalog(id: string): Promise<BranchCatalog> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  const running = inflight.get(id);
  if (running) return running;

  const loader = loaders[id];
  if (!loader) return Promise.resolve(emptyCatalog(id));

  const p = loader()
    .then((mod) => {
      const catalog = normalize(id, mod.default);
      cache.set(id, catalog);
      inflight.delete(id);
      return catalog;
    })
    .catch(() => {
      inflight.delete(id);
      return emptyCatalog(id);   // missing/broken file -> prices simply stay blank, never throws
    });

  inflight.set(id, p);
  return p;
}

/* warm the cache ahead of selection (e.g. on branch-row hover) so committing is
   instant. No-op if unknown / already cached / already loading. */
export function prefetchBranchCatalog(id: string | null | undefined): void {
  if (!id || !loaders[id] || cache.has(id) || inflight.has(id)) return;
  void loadBranchCatalog(id);
}
