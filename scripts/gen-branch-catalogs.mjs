/* Generate one per-branch catalog file (prices + availability) from the shared
   seed. PLACEHOLDER: every branch currently gets the same seed prices; when the
   Cloud-Kitchen API (Foodics/Matrix) lands, this script is replaced by a sync
   that writes real per-branch prices/availability into the same JSON shape
   (so nothing downstream changes). Run: npm run gen:branches */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '..', 'src', 'data');
const outDir = join(dataDir, 'branches');
mkdirSync(outDir, { recursive: true });

const seed = JSON.parse(readFileSync(join(dataDir, 'seed-prices.json'), 'utf8'));

/* branch ids kept in sync with src/lib/branches.ts */
const BRANCH_IDS = ['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11'];

/* fixed timestamp so regenerating is deterministic (no noisy git diffs);
   the real sync will stamp the actual API fetch time. */
const stamp = '2026-09-09T00:00:00.000Z';

for (const id of BRANCH_IDS) {
  const catalog = { branchId: id, updatedAt: stamp, unavailable: [], prices: seed };
  writeFileSync(join(outDir, `${id}.json`), JSON.stringify(catalog, null, 2) + '\n');
}

console.log(`Wrote ${BRANCH_IDS.length} branch catalogs to ${outDir}`);
