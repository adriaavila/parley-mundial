import Link from "next/link";
import { BallMark } from "./BallMark";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-black/40">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-display text-xl uppercase italic"
        >
          <BallMark size={24} />
          ParlAI <span className="text-primary">2026</span>
        </Link>
        <nav className="flex gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <Link href="/como-funciona" className="hover:text-primary transition-colors">
            Cómo funciona
          </Link>
          <Link href="/ligas" className="hover:text-primary transition-colors">
            Ligas
          </Link>
          <Link href="/faq" className="hover:text-primary transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="text-muted-foreground text-[10px] font-mono">
          © 2026 PARLAI · HECHO EN LATAM
        </div>
      </div>
    </footer>
  );
}
