const APP_URL = "https://parlai-mundial.vercel.app/";
const MSG = `🏆 Te reto en ParlAI Mundial — la app de pronósticos del Mundial 2026. ¿Sabes más de fútbol que yo? Demuéstralo: ${APP_URL}`;

export function ShareButtons() {
  const wa = `https://wa.me/?text=${encodeURIComponent(MSG)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(MSG)}`;
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
