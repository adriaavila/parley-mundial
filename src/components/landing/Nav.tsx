import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/landing" className="font-display text-2xl tracking-tighter uppercase italic">
          ParlAI <span className="text-primary">2026</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-mono uppercase tracking-widest text-muted-foreground">
          <Link href="/landing/como-funciona" className="hover:text-primary transition-colors">
            Cómo funciona
          </Link>
          <Link href="/landing/ligas" className="hover:text-primary transition-colors">
            Ligas
          </Link>
          <Link href="/landing/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </div>
        <Link
          href="/"
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide hover:scale-105 transition-transform duration-300"
        >
          Jugar Gratis
        </Link>
      </div>
    </nav>
  );
}
