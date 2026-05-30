import { ImageResponse } from "next/og";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { readFileSync } from "fs";
import { join } from "path";

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

  // Pre-load the stadium hero image from filesystem
  let backgroundImage = "";
  try {
    const imagePath = join(process.cwd(), "public/landing/hero-stadium.jpg");
    const imageBuffer = readFileSync(imagePath);
    backgroundImage = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading hero stadium image for join OG:", error);
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
          backgroundColor: "#08090b",
          color: "#f7f8f4",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {backgroundImage ? (
          <img
            alt=""
            src={backgroundImage}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #07080a, #08090b)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgba(8, 9, 11, 0.72) 0%, rgba(8, 9, 11, 0.96) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 22, letterSpacing: 6, color: "#c8cbc4", textTransform: "uppercase", fontWeight: 600 }}>
                Mundial 2026 · Invitación
              </span>
              <strong style={{ fontSize: 80, color: "#c6ff3d", letterSpacing: -2, lineHeight: 1, fontStyle: "italic", fontWeight: 900 }}>
                PARLAI
              </strong>
            </div>
            <div style={{ fontSize: 80, display: "flex" }}>🏆</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 54, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, maxWidth: 980, textShadow: "0 4px 12px rgba(0,0,0,0.6)" }}>
              {found
                ? `¡Únete a la liga "${leagueName}" de ${ownerName}! Y gánale a todos.`
                : "Domina el pronóstico del Mundial 2026 con tus amigos."}
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(8, 9, 11, 0.65)", fontSize: 22, color: "#f7f8f4", fontWeight: 600 }}>
                Código: {normalizedCode || "INVITE"}
              </span>
              <span style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.22)", background: "rgba(8, 9, 11, 0.65)", fontSize: 22, color: "#f7f8f4", fontWeight: 600 }}>
                {memberCount} {memberCount === 1 ? "participante" : "participantes"}
              </span>
              <span style={{ padding: "10px 20px", borderRadius: 999, background: "#c6ff3d", color: "#0a0b0d", fontSize: 22, fontWeight: 800 }}>
                Gratis · WhatsApp-first
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
