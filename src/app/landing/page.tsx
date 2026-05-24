import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { Countdown } from "@/components/landing/Countdown";
import { ShareButtons } from "@/components/landing/ShareButtons";

const HERO = "/landing/hero-stadium.jpg";

export const metadata: Metadata = {
  title: "ParlAI Mundial 2026 — Pronósticos del Mundial con tus amigos",
  description:
    "La app de pronósticos del Mundial 2026 más competitiva de LATAM. Crea ligas privadas, invita a tus amigos por WhatsApp y demuestra quién sabe más de fútbol.",
  alternates: { canonical: "/landing" },
  openGraph: {
    title: "ParlAI Mundial 2026 — Domina el Pronóstico",
    description:
      "Crea ligas privadas, predice cada partido del Mundial y compite con tus amigos. Gratis.",
    url: "/landing",
    type: "website",
  },
};

export default function LandingIndex() {
  return (
    <>
      <Nav />

      {/* HERO */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 0%, var(--background) 90%), url(${HERO})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-x-0 top-1/2 opacity-10 pointer-events-none select-none overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-[200px] md:text-[280px] font-display uppercase leading-none">
            MUNDIAL 2026 · MUNDIAL 2026 · MUNDIAL 2026 · MUNDIAL 2026 ·&nbsp;
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl animate-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6 uppercase tracking-widest">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              Rumbo a Norteamérica
            </div>
            <h1 className="font-display text-6xl md:text-9xl uppercase leading-[0.9] tracking-tighter mb-8 italic">
              DOMINA EL <br />
              <span className="text-primary">PRONÓSTICO.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 text-pretty leading-relaxed">
              La app de pronósticos más competitiva de LATAM. Crea ligas privadas,
              compite con tus amigos y demuestra que eres el que más sabe de fútbol.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href="/"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-display text-2xl uppercase tracking-tight hover:shadow-[0_0_30px_oklch(0.92_0.22_125/0.4)] transition-all duration-300"
              >
                Empezar a predecir
              </Link>
              <div className="flex -space-x-3 items-center">
                <div className="size-10 rounded-full border-2 border-background bg-slate-800" />
                <div className="size-10 rounded-full border-2 border-background bg-slate-700" />
                <div className="size-10 rounded-full border-2 border-background bg-slate-600" />
                <span className="pl-4 text-sm font-mono text-muted-foreground">
                  Súmate ya
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="py-24 bg-white/[0.03] border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-4xl md:text-6xl uppercase italic mb-16 max-w-2xl">
            Tres pasos. <span className="text-primary">Cero fricción.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                t: "Predice resultados",
                d: "Carga tus marcadores antes de cada partido. Gana puntos por acierto exacto o por tendencia.",
              },
              {
                n: "02",
                t: "Arma tu liga",
                d: "Crea un grupo para tu oficina, tus amigos o tu familia en segundos. Comparte el link por WhatsApp.",
              },
              {
                n: "03",
                t: "Sube en el ranking",
                d: "Compite en tu liga privada y en el ranking global por el título de experto mundialista.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors duration-500"
              >
                <span className="font-mono text-primary text-4xl mb-6 block font-bold">
                  {s.n}
                </span>
                <h3 className="font-display text-2xl uppercase mb-3">{s.t}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHATSAPP VIRAL */}
      <section id="ligas" className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-none mb-8 italic">
              Hecho para <br />
              <span className="text-primary">WHATSAPP.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Comparte tus pronósticos, tus aciertos y el ranking de tu liga con un solo
              toque. Sin registros pesados, solo fútbol y sana competitividad.
            </p>
            <ShareButtons />
          </div>

          <div className="relative">
            <div className="bg-[#0B141A] rounded-2xl p-4 shadow-2xl ring-1 ring-white/10 max-w-sm mx-auto">
              <div className="bg-[#202C33] rounded-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-background to-card relative flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-3">
                      MI PRONÓSTICO
                    </div>
                    <div className="flex items-center gap-6 justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🇦🇷</div>
                        <div className="font-display text-5xl text-primary">2</div>
                      </div>
                      <div className="font-mono text-muted-foreground text-xs">VS</div>
                      <div className="text-center">
                        <div className="text-3xl mb-1">🇲🇽</div>
                        <div className="font-display text-5xl">1</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-white font-bold text-sm">
                    Liga: Los Galácticos de la Ofi
                  </p>
                  <p className="text-xs text-[#8696A0] mt-1 italic">
                    Únete a mi liga en ParlAI y gánale a todos.
                  </p>
                  <p className="text-[#00A884] text-xs mt-2 font-mono">
                    parlai-mundial.vercel.app
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-2 md:-right-6 bg-primary text-primary-foreground size-24 rounded-full flex items-center justify-center font-display text-xs text-center p-2 rotate-12">
              CREA TU LIGA EN 10 SEG
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-24 bg-white/[0.03] border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl uppercase italic mb-3">
              Ranking <span className="text-primary">en vivo</span>
            </h2>
            <p className="text-muted-foreground">
              Los mejores pronosticadores de la semana.
            </p>
          </div>
          <div className="bg-card rounded-2xl ring-1 ring-border divide-y divide-border">
            {[
              { p: "01", n: "Mateo A.", c: "Bogotá, CO", pts: 2450, top: true },
              { p: "02", n: "Santi L.", c: "Buenos Aires, AR", pts: 2310 },
              { p: "03", n: "Valeria P.", c: "CDMX, MX", pts: 2285 },
              { p: "04", n: "Diego R.", c: "Lima, PE", pts: 2190 },
              { p: "05", n: "Camila S.", c: "Santiago, CL", pts: 2104 },
            ].map((r) => (
              <div key={r.p} className="flex items-center p-4 gap-4">
                <span
                  className={`w-8 font-display font-bold ${
                    r.top ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {r.p}
                </span>
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                  {r.n[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-foreground font-medium text-sm truncate">
                    {r.n}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{r.c}</div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-display font-bold tabular-nums ${
                      r.top ? "text-primary" : ""
                    }`}
                  >
                    {r.pts.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COUNTDOWN */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-mono text-primary uppercase tracking-[0.3em] text-xs mb-8">
            Faltan para el pitazo inicial
          </p>
          <Countdown />
          <p className="font-mono text-muted-foreground text-xs mt-8 uppercase tracking-widest">
            11 Jun 2026 · Estadio Azteca
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto bg-primary text-primary-foreground p-12 md:p-16 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="animate-marquee whitespace-nowrap text-[180px] font-display uppercase leading-none">
              ParlAI · ParlAI · ParlAI ·&nbsp;
            </div>
          </div>
          <div className="relative">
            <h2 className="font-display text-5xl md:text-7xl uppercase italic mb-6 leading-none">
              ¿Crees que sabes <br />
              de fútbol?
            </h2>
            <p className="text-lg md:text-xl font-medium mb-10 max-w-xl mx-auto">
              Pruébalo. Es gratis, toma 30 segundos y te puedes burlar de tus amigos
              hasta julio.
            </p>
            <Link
              href="/"
              className="inline-block bg-background text-foreground px-12 py-5 rounded-2xl font-display text-2xl md:text-3xl uppercase hover:scale-105 transition-transform"
            >
              Jugar Gratis
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
