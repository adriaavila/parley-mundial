import Link from "next/link";

export default function NotFound() {
  return (
    <main className="real-app">
      <section className="app-main" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div className="glass-strong" style={{ maxWidth: 560, padding: "32px", textAlign: "center" }}>
          <span style={{ color: "var(--ink-2)", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            404 · Fuera de juego
          </span>
          <h1 style={{ margin: "10px 0 14px", fontFamily: "var(--display)", fontSize: 36 }}>
            Esta página no clasificó al Mundial.
          </h1>
          <p style={{ color: "var(--ink-1)" }}>La ruta que buscas no existe.</p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: 18,
              padding: "12px 22px",
              borderRadius: 999,
              background: "var(--lime)",
              color: "#0a0b0d",
              fontFamily: "var(--mono)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
