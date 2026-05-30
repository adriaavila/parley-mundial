"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useMemo, type ReactNode } from "react";

const FALLBACK_CONVEX_URL = "https://placeholder.convex.cloud";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      console.warn("Missing NEXT_PUBLIC_CONVEX_URL; Convex-backed features are disabled.");
    }
    return new ConvexReactClient(url || FALLBACK_CONVEX_URL);
  }, []);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
