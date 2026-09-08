import type { NextConfig } from "next";

/* GitHub Pages demo build (GITHUB_PAGES=true): static export served under
   /bondok-web. Raw <img src="/bondok/..."> and CSS url(/fonts/...) refs are
   NOT rewritten by basePath - scripts/build-pages.mjs patches them after
   export. Local dev/build/start stay untouched (no basePath). */
const isPages = process.env.GITHUB_PAGES === "true";
const repoBase = "/bondok-web";

const nextConfig: NextConfig = {
  // Windows: default build workers crash intermittently (exit 3221226505)
  experimental: { workerThreads: false, cpus: 1 },
  ...(isPages
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath: repoBase,
        assetPrefix: `${repoBase}/`,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
