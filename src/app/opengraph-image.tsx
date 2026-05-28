import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Use the default Fluid Compute / Node.js runtime (edge is no longer recommended on Vercel).
export const alt = "ParlAI Mundial 2026 — Domina el Pronóstico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  let backgroundImage = "";
  try {
    const imagePath = join(process.cwd(), "public/landing/hero-stadium.jpg");
    const imageBuffer = readFileSync(imagePath);
    backgroundImage = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error reading hero stadium image for root OG:", error);
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
          backgroundImage: backgroundImage
            ? `linear-gradient(to bottom, rgba(8, 9, 11, 0.3) 0%, rgba(8, 9, 11, 0.85) 100%), url(${backgroundImage})`
            : "linear-gradient(135deg, #07080a, #08090b)",
          backgroundSize: "cover",
          backgroundPosition: "center",
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
