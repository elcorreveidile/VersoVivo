'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/firebase/auth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Libros', href: '/admin/books', icon: '📚' },
  { name: 'Poemas', href: '/admin/poems', icon: '✍️' },
  { name: 'Usuarios', href: '/admin/users', icon: '👥' },
  { name: 'Actividad', href: '/admin/activity', icon: '📜' },
  { name: 'Sincronización', href: '/admin/sync', icon: '🔄' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Gestos táctiles para deslizar
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;

    const swipeThreshold = 50;
    const diff = touchStartRef.current - touchEndRef.current;

    // Deslizar de izquierda a derecha (abrir menú)
    if (diff < -swipeThreshold && touchStartRef.current < 50) {
      setMobileMenuOpen(true);
    }
    // Deslizar de derecha a izquierda (cerrar menú)
    else if (diff > swipeThreshold) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          'fixed inset-y-0 left-0 z-30 bg-black border-r border-white/10 transition-transform duration-300 lg:transition-all lg:duration-300',
          // Desktop: siempre visible, colapsable
          'hidden lg:block',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile: oculto por defecto, se desliza
          isMobile && mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className={cn(
                'text-xl font-bold text-[#FFD700]',
                sidebarCollapsed && !isMobile && 'text-2xl'
              )}>
                {sidebarCollapsed && !isMobile ? 'V' : 'VersoVivo'}
              </span>
              {(!sidebarCollapsed || isMobile) && (
                <span className="text-xs text-white/40">Admin</span>
              )}
            </Link>
            {/* Botón cerrar en móvil */}
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-white/60 hover:text-white lg:hidden"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                  title={sidebarCollapsed && !isMobile ? item.name : ''}
                >
                  <span className={cn(
                    'text-xl',
                    sidebarCollapsed && !isMobile ? 'text-2xl mr-0' : 'mr-3'
                  )}>{item.icon}</span>
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
            {(!sidebarCollapsed || isMobile) ? (
              <>
                <div className="flex items-center space-x-3 mb-4">
                  {userProfile?.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || 'Admin'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD700]/30"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700] text-black text-sm font-bold">
                      {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {userProfile?.displayName || 'Admin'}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || 'Admin'}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD700]/30"
                    title={userProfile.displayName || 'Admin'}
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD700] text-black text-sm font-bold"
                    title={userProfile?.displayName || 'Admin'}
                  >
                    {userProfile?.displayName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  title="Cerrar Sesión"
                >
                  🚪
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300',
          // Desktop padding
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
          // Mobile: sin padding
          'pl-0'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 sm:px-8">
            <div className="flex items-center space-x-4">
              {/* Botón menú hamburguesa en móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
              {/* Botón colapsar en desktop */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
              >
                {sidebarCollapsed ? '▶' : '◀'}
              </button>
              <div className="text-sm text-white/40 hidden sm:block">
                Panel de Administración
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-sm text-[#FFD700] hover:text-[#FFEC8B]"
              >
                Ver Sitio →
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
