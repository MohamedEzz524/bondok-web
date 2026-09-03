import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* cap build parallelism - the default worker pool crashes intermittently
     on this machine under memory pressure */
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
};

export default nextConfig;
