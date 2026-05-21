import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const description =
  "Predicciones, ligas y banderas reales para vivir el Mundial 2026 con tus amigos.";

export const metadata: Metadata = {
  title: {
    default: "Parleyia · La Jugada Mundialera",
    template: "%s · Parleyia",
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: "Parleyia",
  openGraph: {
    title: "Parleyia · La Jugada Mundialera",
    description,
    url: siteUrl,
    siteName: "Parleyia",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parleyia · La Jugada Mundialera",
    description,
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
            Parleyia necesita JavaScript activado para mostrar el calendario y tus jugadas.
          </div>
        </noscript>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
