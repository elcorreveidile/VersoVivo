'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getAllUsers } from '@/lib/firebase/admin';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function UsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const usersData = await getAllUsers();
    setUsers(usersData);
    setLoading(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h1>
          <p className="text-white/60">{users.length} usuario{users.length !== 1 ? 's' : ''} en total</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por email o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              />
            </div>
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="all" className="bg-black">Todos los roles</option>
                <option value="admin" className="bg-black">Administradores</option>
                <option value="user" className="bg-black">Usuarios</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.uid} className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all">
              <CardContent className="p-6">
                {/* User Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {user.displayName || 'Usuario'}
                      </h3>
                      <p className="text-sm text-white/60 break-all">{user.email}</p>
                    </div>
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Usuario'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] font-semibold text-lg">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Role Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'bg-white/10 text-white/60 border-white/20'
                    }`}>
                      {user.role === 'admin' ? '🔑 Administrador' : '👤 Usuario'}
                    </span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Favoritos:</span>
                    <span className="text-white font-semibold">{user.favoritePoems?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Leídos:</span>
                    <span className="text-white font-semibold">{user.readPoems?.length || 0}</span>
                  </div>
                </div>

                {/* Account Info */}
                <div className="mb-4 pt-4 border-t border-white/10 space-y-1 text-xs text-white/40">
                  <div className="flex justify-between">
                    <span>Creado:</span>
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                  {user.lastLoginAt && (
                    <div className="flex justify-between">
                      <span>Último acceso:</span>
                      <span>{formatDate(user.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                {/* Active Status */}
                {user.active !== undefined && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      user.active
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {user.active ? '✓ Activo' : '✗ Inactivo'}
                    </span>
                  </div>
                )}
                {/* Actions */}
                <div className="pt-4 border-t border-white/10">
                  <Link href={`/admin/users/${user.uid}`} className="block">
                    <Button
                      className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                    >
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterRole !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios aún'}
            </h3>
            <p className="text-white/60">
              {searchTerm || filterRole !== 'all'
                ? 'Prueba con otros filtros'
                : 'Los usuarios aparecerán aquí cuando se registren'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminRoute>
      <UsersContent />
    </AdminRoute>
  );
}
