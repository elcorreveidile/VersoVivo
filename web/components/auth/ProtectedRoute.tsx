'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: 'redirect' | 'prompt';
}

export function ProtectedRoute({ children, fallback = 'redirect' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      if (fallback === 'redirect') {
        router.push('/login');
      }
    }
  }, [user, loading, router, fallback]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    if (fallback === 'prompt') {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Inicia Sesión
            </h1>
            <p className="text-gray-600 mb-8">
              Necesitas iniciar sesión para ver esta página
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700"
            >
              Ir a Iniciar Sesión
            </a>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
}
