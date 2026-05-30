import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ParlAI Mundial 2026",
    short_name: "ParlAI",
    description: "Pronósticos del Mundial 2026 con ligas privadas. Compite con tus amigos por WhatsApp.",
    start_url: "/play",
    scope: "/",
    display: "standalone",
    background_color: "#08090b",
    theme_color: "#08090b",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
