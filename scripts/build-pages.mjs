/* Build the GitHub Pages demo: static export under /bondok-web, then patch
   the asset references that Next's basePath does not rewrite - raw
   <img src="/bondok/...">, CSS url(/fonts/...), and the same strings inside
   JS chunks / RSC payloads.
   Usage: npm run build:pages */
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const BASE = "/bondok-web";
const OUT = join(process.cwd(), "out");

const res = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, GITHUB_PAGES: "true" },
});
if (res.status !== 0) process.exit(res.status ?? 1);

const EXTS = new Set([".html", ".css", ".js", ".txt", ".json"]);
/* public-folder roots referenced with absolute paths in source */
const ROOTS = ["bondok", "fonts"];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXTS.has(extname(name))) files.push(p);
  }
})(OUT);

let patched = 0;
for (const file of files) {
  const src = readFileSync(file, "utf8");
  let out = src;
  for (const root of ROOTS) {
    // "/bondok/...  '/bondok/...  url(/fonts/...  \"/bondok/... (escaped in RSC payloads)
    out = out
      .replaceAll(`"${BASE}/${root}/`, `"__KEEP__/${root}/`) // guard already-prefixed
      .replaceAll(`"/${root}/`, `"${BASE}/${root}/`)
      .replaceAll(`'/${root}/`, `'${BASE}/${root}/`)
      .replaceAll(`url(/${root}/`, `url(${BASE}/${root}/`)
      .replaceAll(`\\"/${root}/`, `\\"${BASE}/${root}/`)
      .replaceAll(`"__KEEP__/${root}/`, `"${BASE}/${root}/`);
  }
  if (out !== src) {
    writeFileSync(file, out);
    patched++;
  }
}
/* RSC payloads export as nested dirs (menu/__next.menu/__PAGE__.txt) but the
   client fetches flat names (menu/__next.menu.__PAGE__.txt) - write aliases
   so client-side navigation gets real RSC payloads instead of hard reloads. */
let aliases = 0;
(function aliasRsc(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (!statSync(p).isDirectory()) continue;
    if (name.startsWith("__next.")) {
      (function flatten(sub, prefix) {
        for (const inner of readdirSync(sub)) {
          const ip = join(sub, inner);
          if (statSync(ip).isDirectory()) flatten(ip, `${prefix}.${inner}`);
          else {
            writeFileSync(join(dir, `${prefix}.${inner}`), readFileSync(ip));
            aliases++;
          }
        }
      })(p, name);
    } else aliasRsc(p);
  }
})(OUT);

writeFileSync(join(OUT, ".nojekyll"), "");
console.log(`pages build done: ${files.length} files scanned, ${patched} patched, ${aliases} RSC aliases, .nojekyll written`);
