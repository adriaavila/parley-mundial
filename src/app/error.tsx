"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="real-app">
      <section className="app-main" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="glass-strong" style={{ maxWidth: 560, padding: "32px", textAlign: "center" }}>
          <span style={{ color: "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Error inesperado
          </span>
          <h1 style={{ margin: "10px 0 14px", fontFamily: "var(--display)", fontSize: 36 }}>
            Algo salió mal en la cancha.
          </h1>
          <p style={{ color: "var(--ink-1)" }}>Intenta de nuevo. Si persiste, recarga la página.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 18,
              padding: "12px 22px",
              borderRadius: 999,
              background: "var(--lime)",
              color: "#0a0b0d",
              fontFamily: "var(--mono)",
              fontWeight: 700,
            }}
          >
            Reintentar
          </button>
        </div>
      </section>
    </main>
  );
}
