import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Cómo funciona — ParlAI Mundial 2026",
  description:
    "Aprende cómo jugar ParlAI Mundial: el sistema de puntos, las ligas privadas y los pronósticos especiales del Mundial 2026.",
  alternates: { canonical: "/como-funciona" },
  openGraph: {
    title: "Cómo funciona ParlAI Mundial",
    description: "Sistema de puntos, ligas privadas and pronósticos del Mundial 2026.",
    url: "/como-funciona",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Cómo funciona ParlAI Mundial",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo funciona ParlAI Mundial",
    description: "Sistema de puntos, ligas privadas and pronósticos del Mundial 2026.",
    images: ["/opengraph-image"],
  },
};

const POINTS = [
  { p: "5", t: "Acierto exacto", d: "Adivinas el marcador final exacto (ej. 2-1)." },
  { p: "3", t: "Acierto de tendencia", d: "Aciertas quién gana o si hay empate, pero no el marcador." },
  { p: "10", t: "Bonus de fase final", d: "Cada acierto exacto en cuartos, semis o final vale el doble." },
  { p: "25", t: "Campeón del Mundial", d: "Si predices el campeón antes de que arranque el torneo." },
];

export default function ComoFunciona() {
  return (
    <>
      <Nav />
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block font-mono text-xs uppercase tracking-widest text-primary mb-4">
            Reglas del juego
          </div>
          <h1 className="font-display text-6xl md:text-8xl uppercase italic leading-[0.9] mb-8">
            Cómo <span className="text-primary">funciona</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            ParlAI es simple: predice antes de que ruede el balón, suma puntos por cada
            acierto, sube en el ranking de tu liga.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.03] border-y border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl uppercase mb-10">Sistema de puntos</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {POINTS.map((p) => (
              <div
                key={p.t}
                className="p-6 rounded-2xl bg-card border border-border flex gap-5"
              >
                <div className="font-display text-5xl text-primary tabular-nums">
                  +{p.p}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{p.t}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl uppercase italic mb-6">
            Listo. <span className="text-primary">A jugar.</span>
          </h2>
          <Link
            href="/play"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-xl font-display text-2xl uppercase hover:scale-105 transition-transform"
          >
            Crear mi cuenta
          </Link>
        </div>
      </section>
      <Footer />
    </>
  );
}
