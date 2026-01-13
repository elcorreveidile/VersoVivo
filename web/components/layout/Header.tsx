'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

// Public navigation
const publicNavigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Explorar', href: '/explore' },
];

// Authenticated navigation
const authNavigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Explorar', href: '/explore' },
  { name: 'Favoritos', href: '/favorites' },
  { name: 'Perfil', href: '/profile' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  const navigation = user ? authNavigation : publicNavigation;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#FFD700] hover:glow-hover transition-colors">VersoVivo</span>
        </Link>

        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-all hover:text-[#FFD700]',
                pathname === item.href
                  ? 'text-[#FFD700]'
                  : 'text-white/70 hover:text-white'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10"></div>
          ) : user ? (
            <>
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'Usuario'}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-[#FFD700]/30"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700] text-black text-sm font-medium">
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-white/70 hover:text-[#FFD700] transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-white/70 hover:text-[#FFD700] transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-[#FFD700] px-4 py-2 text-sm font-medium text-black hover:bg-[#FFEC8B] transition-colors"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
