"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";

type PublicProfile = {
  avatar: string;
  handle: string;
};

const FALLBACK_PROFILES: PublicProfile[] = [
  { avatar: "⚽", handle: "mundialero" },
  { avatar: "🏆", handle: "capitana" },
  { avatar: "🔥", handle: "golazo" },
  { avatar: "🇲🇽", handle: "tri2026" },
  { avatar: "🇦🇷", handle: "la10" },
];

function cleanHandle(handle: string) {
  return handle.trim().replace(/^@/, "") || "mundialero";
}

export function JoinAvatars() {
  const convex = useConvex();
  const [publicProfiles, setPublicProfiles] = useState<PublicProfile[] | null>(null);
  const [offset, setOffset] = useState(0);
  const [transitionOffset, setTransitionOffset] = useState<number | null>(null);
  const [swapPhase, setSwapPhase] = useState<"idle" | "swapping" | "settling">("idle");
  const offsetRef = useRef(offset);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        const profiles = await convex.query(api.users.recentPublicProfiles, { limit: 12 });
        if (!cancelled) setPublicProfiles(profiles);
      } catch {
        if (!cancelled) setPublicProfiles(null);
      }
    }

    void loadProfiles();
    const refresh = window.setInterval(loadProfiles, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(refresh);
    };
  }, [convex]);

  const profiles = useMemo(() => {
    const source = publicProfiles && publicProfiles.length > 0 ? publicProfiles : FALLBACK_PROFILES;
    return source.map((profile) => ({
      avatar: profile.avatar.trim() || "⚽",
      handle: cleanHandle(profile.handle),
    }));
  }, [publicProfiles]);

  useEffect(() => {
    if (profiles.length <= 1) return;

    let settle: number | undefined;
    let release: number | undefined;
    const interval = window.setInterval(() => {
      const nextOffset = (offsetRef.current + 1) % profiles.length;
      setTransitionOffset(nextOffset);
      setSwapPhase("swapping");
      settle = window.setTimeout(() => {
        offsetRef.current = nextOffset;
        setOffset(nextOffset);
        setSwapPhase("settling");
        release = window.setTimeout(() => {
          setTransitionOffset(null);
          setSwapPhase("idle");
        }, 80);
      }, 560);
    }, 2100);

    return () => {
      window.clearInterval(interval);
      if (settle !== undefined) window.clearTimeout(settle);
      if (release !== undefined) window.clearTimeout(release);
    };
  }, [profiles.length]);

  const visibleCount = Math.min(3, profiles.length);
  const activeOffset = transitionOffset ?? offset;
  const visibleProfiles = Array.from(
    { length: visibleCount },
    (_, index) => profiles[(offset + index) % profiles.length],
  );
  const nextVisibleProfiles = Array.from(
    { length: visibleCount },
    (_, index) => profiles[(activeOffset + index) % profiles.length],
  );
  const featured = profiles[offset % profiles.length] ?? profiles[0];
  const nextFeatured = transitionOffset === null ? featured : profiles[transitionOffset] ?? featured;

  return (
    <div className="join-avatar-strip" aria-label="Usuarios sumándose a ParlAI">
      <div className={`join-avatar-stack is-${swapPhase}`}>
        <div className="join-avatar-track">
          {visibleProfiles.map((profile, index) => {
            const nextProfile = nextVisibleProfiles[index] ?? profile;
            return (
              <span
                className="join-avatar-circle"
                aria-label={`@${nextProfile.handle}`}
                key={index}
                style={{ zIndex: visibleCount - index }}
                title={`@${nextProfile.handle}`}
              >
                <span className="join-avatar-face current">{profile.avatar}</span>
                <span className="join-avatar-face next">{nextProfile.avatar}</span>
              </span>
            );
          })}
        </div>
      </div>
      <span className={`join-avatar-copy is-${swapPhase}`}>
        <span>Súmate ya</span>
        <strong>
          <span className="join-handle-face current">@{featured.handle}</span>
          <span className="join-handle-face next">@{nextFeatured.handle}</span>
        </strong>
      </span>
    </div>
  );
}
