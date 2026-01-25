import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-[var(--accent)]">VersoVivo</span>
            <p className="mt-2 text-sm text-white/60">
              Poesía que cobra vida en la era digital
            </p>
          </div>

          <div className="flex space-x-6">
            <Link href="/about" className="text-sm text-white/60 hover:text-[var(--accent)] transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/privacy" className="text-sm text-white/60 hover:text-[var(--accent)] transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-white/60 hover:text-[var(--accent)] transition-colors">
              Términos
            </Link>
            <Link href="/contact" className="text-sm text-white/60 hover:text-[var(--accent)] transition-colors">
              Contacto
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} VersoVivo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
