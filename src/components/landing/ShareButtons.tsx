const APP_URL = "https://parlai.frontia.app";
const PITCH =
  "🏆 Te reto en ParlAI Mundial — la app de pronósticos del Mundial 2026. ¿Sabes más de fútbol que yo? Demuéstralo:";
const link = (src: string) => `${APP_URL}/?src=${src}`;

export function ShareButtons() {
  // WhatsApp: URL inline in the text body.
  const wa = `https://wa.me/?text=${encodeURIComponent(`${PITCH} ${link("wa")}`)}`;
  // X: text and url as separate params so X dedupes and builds the link card.
  const x = `https://x.com/intent/tweet?text=${encodeURIComponent(PITCH)}&url=${encodeURIComponent(link("x"))}`;
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={wa}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
      >
        Compartir en WhatsApp
      </a>
      <a
        href={x}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-2 bg-white/10 text-foreground px-5 py-3 rounded-xl font-bold hover:bg-white/20 transition-all"
      >
        Compartir en X
      </a>
    </div>
  );
}
