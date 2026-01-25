'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/firebase/admin';

interface AdminRouteProps {
  children: React.ReactNode;
  fallback?: 'redirect' | 'forbidden';
}

export default function AdminRoute({ children, fallback = 'redirect' }: AdminRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!loading && !user) {
        // Not authenticated
        if (fallback === 'redirect') {
          router.push('/login');
        }
        setCheckingAdmin(false);
        return;
      }

      if (!loading && user) {
        // Check if admin
        const adminStatus = await isAdmin(user.uid);
        setIsAuthorized(adminStatus);
        setCheckingAdmin(false);

        if (!adminStatus && fallback === 'redirect') {
          router.push('/');
        }
      }
    };

    checkAdminStatus();
  }, [user, loading, router, fallback]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white/60">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    if (fallback === 'forbidden') {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Acceso Denegado</h1>
            <p className="text-white/60 mb-8">No tienes permisos para acceder a esta página.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-[var(--accent)] text-black px-6 py-3 rounded-lg hover:bg-[#FFEC8B] transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
