import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bondok-web",
  assetPrefix: "/bondok-web/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;