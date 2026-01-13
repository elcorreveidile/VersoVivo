import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-blue-600">VersoVivo</span>
            <p className="mt-2 text-sm text-gray-600">
              Poesía que cobra vida en la era digital
            </p>
          </div>

          <div className="flex space-x-6">
            <Link href="/about" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Términos
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VersoVivo. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
