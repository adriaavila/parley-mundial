"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { useMemo, type ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) {
      throw new Error("Missing NEXT_PUBLIC_CONVEX_URL");
    }
    return new ConvexReactClient(url);
  }, []);

  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}
