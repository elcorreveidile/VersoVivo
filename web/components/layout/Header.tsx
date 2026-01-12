'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Explorar', href: '/explore' },
  { name: 'Favoritos', href: '/favorites' },
  { name: 'Perfil', href: '/profile' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-blue-600">VersoVivo</span>
        </Link>

        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                pathname === item.href
                  ? 'text-blue-600'
                  : 'text-gray-700'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
  );
}
