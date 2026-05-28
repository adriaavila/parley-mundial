import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Use default Node.js runtime (edge runtime doesn't have filesystem access)
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
    console.error("Error reading hero stadium image:", error);
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
          padding: 80,
          backgroundColor: "#08090b",
          color: "#f7f8f4",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {backgroundImage ? (
          <img
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
            background: "linear-gradient(to bottom, rgba(8, 9, 11, 0.25) 0%, rgba(8, 9, 11, 0.85) 100%)",
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
          {/* Brand Kicker */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span
              style={{
                fontSize: 20,
                letterSpacing: 6,
                color: "#c8cbc4",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Mundial 2026
            </span>
            <strong
              style={{
                fontSize: 72,
                color: "#c6ff3d",
                letterSpacing: -2,
                lineHeight: 1,
                fontStyle: "italic",
                fontWeight: 900,
              }}
            >
              PARLAI MUNDIAL
            </strong>
          </div>

          {/* Feature Highlights & CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <span
              style={{
                fontSize: 54,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.1,
                maxWidth: 950,
                textShadow: "0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              Crea ligas privadas por WhatsApp y domina el pronóstico con tus amigos.
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <span
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(8, 9, 11, 0.65)",
                  fontSize: 20,
                  color: "#f7f8f4",
                  fontWeight: 600,
                }}
              >
                Ligas privadas
              </span>
              <span
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(8, 9, 11, 0.65)",
                  fontSize: 20,
                  color: "#f7f8f4",
                  fontWeight: 600,
                }}
              >
                WhatsApp-first
              </span>
              <span
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "#c6ff3d",
                  color: "#0a0b0d",
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                Gratis · Pronóstico 2026
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
