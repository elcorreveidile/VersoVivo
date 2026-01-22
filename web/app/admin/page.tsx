'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getAdminStats } from '@/lib/firebase/admin';
import { AdminStats } from '@/types/poem';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function DashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await getAdminStats();
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/60">Cargando estadísticas...</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-white/10 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 mb-4">Error al cargar estadísticas</p>
        <button
          onClick={loadStats}
          className="bg-[#FFD700] text-black px-6 py-2 rounded-lg hover:bg-[#FFEC8B]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/60">Resumen general de la plataforma</p>
      </div>

      {/* Key Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Usuarios</div>
            <div className="text-3xl font-bold text-[#FFD700]">{stats.totalUsers}</div>
            <div className="text-xs text-white/40 mt-2">+{stats.newUsersThisWeek} esta semana</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Poemas</div>
            <div className="text-3xl font-bold text-[#FFD700]">{stats.totalPoems}</div>
            <div className="text-xs text-white/40 mt-2">Contenido total</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Libros</div>
            <div className="text-3xl font-bold text-[#FFD700]">{stats.totalBooks}</div>
            <div className="text-xs text-white/40 mt-2">Libros publicados</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-sm text-white/60 mb-2">Usuarios Activos</div>
            <div className="text-3xl font-bold text-[#FFD700]">{stats.activeUsers}</div>
            <div className="text-xs text-white/40 mt-2">Últimos 7 días</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Poemas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Read */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Poemas Más Leídos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topReadPoems.length > 0 ? (
              <div className="space-y-3">
                {stats.topReadPoems.slice(0, 5).map((poem, index) => (
                  <div key={poem.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]/10 text-[#FFD700] text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{poem.title}</div>
                      </div>
                    </div>
                    <div className="text-sm text-[#FFD700] font-semibold">{poem.reads}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>

        {/* Most Favorited */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Poemas Más Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topFavoritePoems.length > 0 ? (
              <div className="space-y-3">
                {stats.topFavoritePoems.slice(0, 5).map((poem, index) => (
                  <div key={poem.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD700]/10 text-[#FFD700] text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{poem.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-red-400">♥</span>
                      <span className="text-sm text-[#FFD700] font-semibold">{poem.favorites}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-center py-8">No hay datos disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#FFD700]/5 border-[#FFD700]/20 backdrop-blur-sm">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Link href="/admin/books">
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#FFD700]/50 transition-all text-left">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-medium text-white">Gestionar Libros</div>
                <div className="text-xs text-white/40 mt-1">Crear y editar libros</div>
              </button>
            </Link>
            <Link href="/admin/poems">
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#FFD700]/50 transition-all text-left">
                <div className="text-2xl mb-2">✍️</div>
                <div className="text-sm font-medium text-white">Gestionar Poemas</div>
                <div className="text-xs text-white/40 mt-1">Añadir contenido multimedia</div>
              </button>
            </Link>
            <Link href="/admin/users">
              <button className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:border-[#FFD700]/50 transition-all text-left">
                <div className="text-2xl mb-2">👥</div>
                <div className="text-sm font-medium text-white">Ver usuarios</div>
                <div className="text-xs text-white/40 mt-1">Gestionar usuarios</div>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminRoute>
      <DashboardContent />
    </AdminRoute>
  );
}
