'use client';

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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-black border-r border-white/10">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-[#FFD700]">VersoVivo</span>
              <span className="text-xs text-white/40">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all',
                    isActive
                      ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="text-xl mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-white/10">
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
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 h-16 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-8">
            <div className="text-sm text-white/40">
              Panel de Administración
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
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
