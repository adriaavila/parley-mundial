"use client";

import { useEffect, useState } from "react";

// Mundial 2026: kickoff 11 de junio de 2026, Estadio Azteca
const TARGET = new Date("2026-06-11T18:00:00-06:00").getTime();

function diff() {
  const ms = Math.max(0, TARGET - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown() {
  const [t, setT] = useState(diff);
  useEffect(() => {
    const i = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex justify-center gap-6 md:gap-12">
      {[
        { v: t.days, l: "Días" },
        { v: t.hours, l: "Hrs" },
        { v: t.minutes, l: "Min" },
        { v: t.seconds, l: "Seg", accent: true },
      ].map((u) => (
        <div key={u.l} className="flex flex-col">
          <span
            className={`font-display text-5xl md:text-8xl tabular-nums ${
              u.accent ? "text-primary" : ""
            }`}
          >
            {String(u.v).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
