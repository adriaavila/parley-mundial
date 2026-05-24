import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { ShareButtons } from "@/components/landing/ShareButtons";

export const metadata: Metadata = {
  title: "Ligas privadas — ParlAI Mundial 2026",
  description:
    "Crea ligas privadas con tus amigos, tu oficina o tu familia. Invita por WhatsApp y compite por el ranking del Mundial 2026.",
  alternates: { canonical: "/landing/ligas" },
  openGraph: {
    title: "Ligas privadas — ParlAI Mundial",
    description: "Crea una liga, invita por WhatsApp, gana el Mundial entre amigos.",
    url: "/landing/ligas",
    type: "website",
  },
};

export default function Ligas() {
  return (
    <>
      <Nav />
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block font-mono text-xs uppercase tracking-widest text-primary mb-4">
            Donde se cocina la rivalidad
          </div>
          <h1 className="font-display text-6xl md:text-8xl uppercase italic leading-[0.9] mb-8">
            Ligas <span className="text-primary">privadas.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            La oficina. El grupo del fútbol del jueves. Tus primos. Crea una liga en 10
            segundos, comparte el link por WhatsApp y que arranque el juego.
          </p>
          <ShareButtons />
        </div>
      </section>

      <section className="py-16 px-6 bg-white/[0.03] border-y border-border">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { t: "Sin límite", d: "Crea tantas ligas como quieras. Una para cada grupo." },
            { t: "Ranking propio", d: "Tabla privada que solo ven los miembros de tu liga." },
            {
              t: "Invitación 1-tap",
              d: "Un link único. Compártelo en el grupo de WhatsApp y listo.",
            },
          ].map((f) => (
            <div key={f.t} className="p-8 rounded-2xl bg-card border border-border">
              <h3 className="font-display text-2xl uppercase mb-3 text-primary">
                {f.t}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <Link
          href="/"
          className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-xl font-display text-2xl uppercase hover:scale-105 transition-transform"
        >
          Crear mi liga ahora
        </Link>
      </section>
      <Footer />
    </>
  );
}
