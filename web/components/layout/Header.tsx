'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

// Admin navigation (only for admins)
const adminNavigation = [
  { name: '⚙️ Admin', href: '/admin' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = user ? authNavigation : publicNavigation;
  const isAdmin = userProfile?.role === 'admin';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-[#FFD700] hover:glow-hover transition-colors">VersoVivo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {[...navigation, ...(isAdmin ? adminNavigation : [])].map((item) => (
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

        {/* Desktop User Menu */}
        <div className="hidden md:flex items-center space-x-4">
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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          {user && isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-[#FFD700] px-3 py-2 rounded-lg hover:bg-[#FFD700]/10 transition-colors"
            >
              ⚙️
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {[...navigation, ...(isAdmin ? adminNavigation : [])].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={cn(
                  'block px-3 py-3 rounded-lg text-base font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-[#FFD700]/10 text-[#FFD700]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {item.name}
              </Link>
            ))}

            {user ? (
              <>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    {userProfile?.photoURL ? (
                      <img
                        src={userProfile.photoURL}
                        alt={userProfile.displayName || 'Usuario'}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD700]/30"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700] text-black text-base font-medium">
                        {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {userProfile?.displayName || 'Usuario'}
                      </p>
                      <p className="text-xs text-white/60 truncate">
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                    className="w-full mt-3 text-left px-3 py-3 rounded-lg text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="border-t border-white/10 pt-4 mt-4 space-y-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-3 rounded-lg text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors text-center"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="block px-3 py-3 rounded-lg text-base font-medium bg-[#FFD700] text-black hover:bg-[#FFEC8B] transition-colors text-center"
                  >
                    Registrarse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
