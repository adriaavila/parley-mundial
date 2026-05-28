import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

const FAQ = [
  {
    q: "¿ParlAI Mundial es gratis?",
    a: "Sí, 100%. Jugar, crear ligas e invitar amigos es gratis.",
  },
  {
    q: "¿Necesito descargar una app?",
    a: "No. ParlAI funciona desde el navegador en móvil o escritorio.",
  },
  {
    q: "¿Cómo invito a mis amigos?",
    a: "Crea una liga, copia el link de invitación y pégalo en tu grupo de WhatsApp. Quien entre por ese link queda automáticamente en tu liga.",
  },
  {
    q: "¿Qué pasa si no pronostico un partido?",
    a: "Recibes 0 puntos en ese partido. Te recomendamos activar recordatorios para no perderte ninguno.",
  },
  {
    q: "¿Cuándo cierra el pronóstico de cada partido?",
    a: "Justo antes del pitazo inicial. Una vez arrancado el partido, ya no se puede modificar tu pronóstico.",
  },
  {
    q: "¿Hay premios?",
    a: "Los premios principales son el bragging rights y subir en el ranking. Algunas ligas privadas organizan premios entre miembros (asado, cerveza, lo que decidan).",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const metadata: Metadata = {
  title: "Preguntas frecuentes — ParlAI Mundial 2026",
  description:
    "Todo lo que necesitas saber sobre ParlAI Mundial: cómo jugar, cómo crear ligas privadas, sistema de puntos y más.",
  alternates: { canonical: "/landing/faq" },
  openGraph: {
    title: "Preguntas frecuentes — ParlAI",
    description: "Cómo jugar, ligas privadas, puntos y más.",
    url: "/landing/faq",
    type: "website",
    images: [
      {
        url: "/landing/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Preguntas frecuentes — ParlAI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas frecuentes — ParlAI",
    description: "Cómo jugar, ligas privadas, puntos y más.",
    images: ["/landing/opengraph-image"],
  },
};

export default function Faq() {
  return (
    <>
      <Nav />
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block font-mono text-xs uppercase tracking-widest text-primary mb-4">
            FAQ
          </div>
          <h1 className="font-display text-5xl md:text-7xl uppercase italic leading-[0.9] mb-12">
            Preguntas <br />
            <span className="text-primary">frecuentes.</span>
          </h1>

          <div className="divide-y divide-border">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-6">
                <summary className="cursor-pointer list-none flex justify-between items-start gap-6">
                  <h3 className="font-display text-xl md:text-2xl uppercase">{f.q}</h3>
                  <span className="text-primary text-3xl leading-none transition-transform group-open:rotate-45 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-muted-foreground mt-4 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/"
              className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-xl font-display text-2xl uppercase hover:scale-105 transition-transform"
            >
              Empezar a jugar
            </Link>
          </div>
        </div>
      </section>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
    </>
  );
}
