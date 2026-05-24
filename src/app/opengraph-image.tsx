import { ImageResponse } from "next/og";

// Use the default Fluid Compute / Node.js runtime (edge is no longer recommended on Vercel).
export const alt = "ParlAI Mundial 2026 — Domina el Pronóstico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "radial-gradient(circle at 18% 4%, rgba(198,255,61,0.22), transparent 38%)," +
            "radial-gradient(circle at 82% 92%, rgba(59,130,255,0.28), transparent 42%)," +
            "linear-gradient(135deg, #07080a, #08090b)",
          color: "#f7f8f4",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 22, letterSpacing: 6, color: "#c8cbc4", textTransform: "uppercase" }}>
            Mundial 2026
          </span>
          <strong style={{ fontSize: 96, color: "#c6ff3d", letterSpacing: -2, lineHeight: 1 }}>
            ParlAI
          </strong>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, maxWidth: 980 }}>
            Domina el pronóstico del Mundial 2026 con tus amigos.
          </span>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", fontSize: 22, color: "#c8cbc4" }}>
              Ligas privadas
            </span>
            <span style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", fontSize: 22, color: "#c8cbc4" }}>
              72 partidos
            </span>
            <span style={{ padding: "10px 18px", borderRadius: 999, background: "#c6ff3d", color: "#0a0b0d", fontSize: 22, fontWeight: 800 }}>
              Gratis · WhatsApp-first
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
