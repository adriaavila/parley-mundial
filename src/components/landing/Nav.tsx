import Link from "next/link";
import { BallMark } from "./BallMark";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-2xl tracking-tighter uppercase italic"
        >
          <BallMark
            size={30}
            className="transition-transform duration-500 group-hover:rotate-[160deg]"
          />
          ParlAI <span className="text-primary">2026</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-mono uppercase tracking-widest text-muted-foreground">
          <Link href="/como-funciona" className="hover:text-primary transition-colors">
            Cómo funciona
          </Link>
          <Link href="/ligas" className="hover:text-primary transition-colors">
            Ligas
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </div>
        <Link
          href="/play"
          className="bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide hover:scale-105 transition-transform duration-300"
        >
          Jugar Gratis
        </Link>
      </div>
    </nav>
  );
}
