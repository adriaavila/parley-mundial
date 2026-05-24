import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack's project root so it does not walk parent directories looking
  // for lockfiles. This stops the spurious file-system probes that surfaced as
  // bursts of node worker spawns during `next dev`.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
