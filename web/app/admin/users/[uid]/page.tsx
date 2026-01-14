'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminRoute from '@/components/auth/AdminRoute';
import { getAllPoemsForAdmin } from '@/lib/firebase/admin';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function UserDetailContent() {
  const router = useRouter();
  const params = useParams();
  const userId = params.uid as string;
  const [user, setUser] = useState<any>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Cargar usuario
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }

      // Cargar poemas para mostrar favoritos/leídos
      const poemsData = await getAllPoemsForAdmin();
      setPoems(poemsData);
    } catch (error) {
      console.error('Error loading user:', error);
      setMessage('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (newRole: 'user' | 'admin') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/' + userId + '/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        setMessage('✅ Rol actualizado correctamente');
        loadUserData();
      } else {
        setMessage('❌ Error al actualizar rol');
      }
    } catch (error) {
      setMessage('❌ Error al actualizar rol');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de desactivar este usuario? No podrá acceder a la aplicación.'
    );

    if (!confirmed) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users/' + userId + '/deactivate', {
        method: 'POST'
      });

      if (response.ok) {
        setMessage('✅ Usuario desactivado');
        loadUserData();
      } else {
        setMessage('❌ Error al desactivar usuario');
      }
    } catch (error) {
      setMessage('❌ Error al desactivar usuario');
    } finally {
      setActionLoading(false);
    }
  };

  const getPoemById = (poemId: string) => {
    return poems.find(p => p.id === poemId);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-white/60 mt-4">Cargando usuario...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Usuario no encontrado</h1>
        <Link href="/admin/users">
          <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
            ← Volver a Usuarios
          </Button>
        </Link>
      </div>
    );
  }

  const favoritePoemsList = (user.favoritePoems || []).map(getPoemById).filter(Boolean);
  const readPoemsList = (user.readPoems || []).map(getPoemById).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Detalle de Usuario</h1>
          <p className="text-white/60">Información completa y actividad del usuario</p>
        </div>
        <Link href="/admin/users">
          <Button variant="outline" className="bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black">
            ← Volver
          </Button>
        </Link>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('✅') ? 'bg-green-900/50 border border-green-500/30 text-green-200' :
          'bg-red-900/50 border border-red-500/30 text-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* User Info Card */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Información del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6 mb-6">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuario'}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#FFD700]/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center text-[#FFD700] font-bold text-3xl">
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{user.displayName || 'Usuario'}</h2>
              <p className="text-white/70 mb-4">{user.email}</p>

              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                  user.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : 'bg-white/10 text-white/60 border-white/20'
                }`}>
                  {user.role === 'admin' ? '🔑 Administrador' : '👤 Usuario'}
                </span>

                {user.active !== undefined && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                    user.active
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {user.active ? '✓ Activo' : '✗ Inactivo'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">UID:</span>
              <span className="text-white ml-2 font-mono text-xs">{user.id}</span>
            </div>
            <div>
              <span className="text-white/60">Creado:</span>
              <span className="text-white ml-2">
                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('es-ES') : 'N/A'}
              </span>
            </div>
            {user.lastLoginAt && (
              <div>
                <span className="text-white/60">Último acceso:</span>
                <span className="text-white ml-2">
                  {new Date(user.lastLoginAt.seconds * 1000).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Acciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Cambiar Rol
            </label>
            <div className="flex gap-2">
              <Button
                onClick={() => handleChangeRole('user')}
                disabled={actionLoading || user.role === 'user'}
                className="flex-1 bg-black text-white border-white/20 hover:bg-white/10"
              >
                Hacer Usuario
              </Button>
              <Button
                onClick={() => handleChangeRole('admin')}
                disabled={actionLoading || user.role === 'admin'}
                className="flex-1 bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
              >
                Hacer Admin
              </Button>
            </div>
          </div>

          {user.active !== false && (
            <Button
              onClick={handleDeactivate}
              disabled={actionLoading}
              className="w-full bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-950/30"
            >
              Desactivar Usuario
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">❤️ Poemas Favoritos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFD700] mb-2">{favoritePoemsList.length}</p>
            <p className="text-sm text-white/60">poemas en favoritos</p>

            {favoritePoemsList.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {favoritePoemsList.slice(0, 10).map((poem: any) => (
                  <div key={poem.id} className="text-sm p-2 bg-white/5 rounded">
                    <div className="text-white font-medium">{poem.title}</div>
                    <div className="text-white/60 text-xs">{poem.author}</div>
                  </div>
                ))}
                {favoritePoemsList.length > 10 && (
                  <p className="text-xs text-white/40">...y {favoritePoemsList.length - 10} más</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">📖 Poemas Leídos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#FFD700] mb-2">{readPoemsList.length}</p>
            <p className="text-sm text-white/60">poemas leídos</p>

            {readPoemsList.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {readPoemsList.slice(0, 10).map((poem: any) => (
                  <div key={poem.id} className="text-sm p-2 bg-white/5 rounded">
                    <div className="text-white font-medium">{poem.title}</div>
                    <div className="text-white/60 text-xs">{poem.author}</div>
                  </div>
                ))}
                {readPoemsList.length > 10 && (
                  <p className="text-xs text-white/40">...y {readPoemsList.length - 10} más</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UserDetailPage() {
  return (
    <AdminRoute>
      <UserDetailContent />
    </AdminRoute>
  );
}
