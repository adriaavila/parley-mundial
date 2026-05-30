import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's project root so it does not walk parent directories looking
  // for lockfiles. This stops the spurious file-system probes that surfaced as
  // bursts of node worker spawns during `next dev`.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  async redirects() {
    // Landing moved to root and the app moved to /play. Keep old shared links alive.
    return [
      { source: "/landing", destination: "/", permanent: true },
      { source: "/landing/como-funciona", destination: "/como-funciona", permanent: true },
      { source: "/landing/faq", destination: "/faq", permanent: true },
      { source: "/landing/ligas", destination: "/ligas", permanent: true },
    ];
  },
};

export default nextConfig;
