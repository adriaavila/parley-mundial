import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://parlai-mundial.vercel.app");

const description =
  "Pronósticos del Mundial 2026 con tus amigos. Crea ligas privadas, invita por WhatsApp y demuestra quién sabe más de fútbol.";

export const metadata: Metadata = {
  title: {
    default: "ParlAI Mundial 2026 — Domina el Pronóstico",
    template: "%s · ParlAI Mundial",
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: "ParlAI Mundial",
  openGraph: {
    title: "ParlAI Mundial 2026 — Domina el Pronóstico",
    description,
    url: siteUrl,
    siteName: "ParlAI Mundial",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ParlAI Mundial 2026 — Domina el Pronóstico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ParlAI Mundial 2026 — Domina el Pronóstico",
    description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript>
          <div style={{ padding: "24px", color: "#f7f8f4", background: "#08090b" }}>
            ParlAI Mundial necesita JavaScript activado para mostrar el calendario y tus jugadas.
          </div>
        </noscript>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
