import { ImageResponse } from "next/og";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export const alt = "Te invitaron a una liga en ParlAI Mundial 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalizedCode = code ? code.trim().toUpperCase() : "";

  let leagueName = "Quiniela Social";
  let ownerName = "Tu Amigo";
  let memberCount = 1;
  let found = false;

  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const league = await convex.query(api.leagues.getByCode, { code: normalizedCode });
    if (league) {
      leagueName = league.name;
      ownerName = league.ownerName;
      memberCount = league.memberCount;
      found = true;
    }
  } catch (error) {
    console.error("Error fetching league for OG Image:", error);
  }

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
            "radial-gradient(circle at 18% 4%, rgba(198,255,61,0.25), transparent 38%)," +
            "radial-gradient(circle at 82% 92%, rgba(59,130,255,0.28), transparent 42%)," +
            "linear-gradient(135deg, #07080a, #08090b)",
          color: "#f7f8f4",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 22, letterSpacing: 6, color: "#c8cbc4", textTransform: "uppercase" }}>
              Mundial 2026 · Invitación
            </span>
            <strong style={{ fontSize: 80, color: "#c6ff3d", letterSpacing: -2, lineHeight: 1 }}>
              ParlAI
            </strong>
          </div>
          <div style={{ fontSize: 80, display: "flex" }}>🏆</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, maxWidth: 980 }}>
            {found
              ? `¡Únete a la liga "${leagueName}" de ${ownerName}! Y gánale a todos.`
              : "Domina el pronóstico del Mundial 2026 con tus amigos."}
          </span>
          <div style={{ display: "flex", gap: 14 }}>
            <span style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", fontSize: 22, color: "#c8cbc4" }}>
              Código: {normalizedCode || "INVITE"}
            </span>
            <span style={{ padding: "10px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.18)", fontSize: 22, color: "#c8cbc4" }}>
              {memberCount} {memberCount === 1 ? "participante" : "participantes"}
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
