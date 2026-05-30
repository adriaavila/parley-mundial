"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface JoinClientProps {
  code: string;
  initialLeague: {
    name: string;
    ownerName: string;
    memberCount: number;
  } | null;
}

export default function JoinClient({ code, initialLeague }: JoinClientProps) {
  const router = useRouter();

  // Subscribe to real-time league updates, using server-preloaded data as fallback
  const leagueQuery = useQuery(api.leagues.getByCode, { code });
  const league = leagueQuery !== undefined ? leagueQuery : initialLeague;

  useEffect(() => {
    // Check if session exists
    const session = window.localStorage.getItem("parleyia:session");
    if (session && code) {
      // Redirect to the app where joining is handled automatically
      router.push(`/play?join=${code}`);
    }
  }, [code, router]);

  if (league === undefined) {
    return (
      <main className="auth-shell">
        <div
          className="auth-card glass-strong"
          style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}
        >
          <div style={{ textAlign: "center" }}>
            <span
              className="animate-pulse"
              style={{ fontSize: "24px", fontFamily: "var(--mono)", color: "var(--lime)" }}
            >
              Buscando liga...
            </span>
          </div>
        </div>
      </main>
    );
  }

  if (league === null) {
    return (
      <main className="auth-shell">
        <section className="auth-card glass-strong" style={{ display: "block", textAlign: "center" }}>
          <div className="auth-copy" style={{ marginBottom: "32px" }}>
            <span style={{ color: "var(--red)", letterSpacing: "0.1em" }}>Código Inválido</span>
            <h1 style={{ fontSize: "48px", marginTop: "12px" }}>Liga no encontrada</h1>
            <p style={{ margin: "16px auto", maxWidth: "450px" }}>
              El enlace de invitación que usaste es inválido o la liga ha sido eliminada por su creador.
            </p>
          </div>
          <Link
            href="/"
            className="save-pick"
            style={{
              display: "inline-block",
              textDecoration: "none",
              textAlign: "center",
              width: "auto",
              padding: "14px 28px",
            }}
          >
            Ir al inicio
          </Link>
        </section>
      </main>
    );
  }

  const joinUrl = `/play?join=${code}`;

  return (
    <main className="auth-shell">
      <section
        className="auth-card glass-strong"
        style={{ display: "grid", gridTemplateColumns: "1fr", maxWidth: "600px", textAlign: "center" }}
      >
        <div className="auth-copy" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ letterSpacing: "0.2em" }}>Invitación Especial</span>
          <div style={{ fontSize: "72px", margin: "20px 0 10px" }}>🏆</div>
          <h1 style={{ fontSize: "54px", margin: "8px 0 16px" }}>
            Te invitaron a <br />
            <span style={{ color: "var(--lime)" }}>{league.name}</span>
          </h1>
          <p style={{ fontSize: "18px", color: "var(--ink-1)", marginBottom: "32px", maxWidth: "480px" }}>
            Creada por <strong>{league.ownerName}</strong>. Hay <strong>{league.memberCount} {league.memberCount === 1 ? "participante" : "participantes"}</strong> listos para competir en ParlAI.
          </p>
        </div>

        <div style={{ display: "grid", gap: "14px" }}>
          <Link
            href={joinUrl}
            className="save-pick"
            style={{
              textDecoration: "none",
              fontSize: "18px",
              padding: "16px",
              display: "grid",
              placeItems: "center",
              fontWeight: "bold",
            }}
          >
            Aceptar Invitación
          </Link>

          <Link
            href="/"
            style={{
              fontFamily: "var(--mono)",
              color: "var(--ink-2)",
              fontSize: "13px",
              textDecoration: "none",
              marginTop: "8px",
            }}
          >
            Ver cómo funciona →
          </Link>
        </div>
      </section>
    </main>
  );
}
