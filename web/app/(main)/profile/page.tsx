'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserReadPoems, updateUserProfile } from '@/lib/firebase/user';
import { signOut } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Poem } from '@/types/poem';

function ProfileContent() {
  const { userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [readPoems, setReadPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhotoURL(userProfile.photoURL || '');
      loadReadPoems();
    }
  }, [userProfile]);

  const loadReadPoems = async () => {
    if (!userProfile) return;

    setLoading(true);
    const poems = await getUserReadPoems(userProfile.uid);
    // Get last 5 read poems (reverse to show most recent first)
    setReadPoems(poems.reverse().slice(0, 5));
    setLoading(false);
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    setError('');

    const result = await updateUserProfile(userProfile.uid, {
      displayName: displayName.trim(),
      photoURL: photoURL.trim(),
    });

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setDisplayName(userProfile?.displayName || '');
    setPhotoURL(userProfile?.photoURL || '');
    setEditing(false);
    setError('');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!userProfile) {
    return <div className="text-center py-12">Cargando perfil...</div>;
  }

  const stats = [
    { label: 'Favoritos', value: userProfile.favoritePoems?.length || 0 },
    { label: 'Leídos', value: userProfile.readPoems?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Mi Perfil
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Gestiona tu información y preferencias
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8 ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName || 'Usuario'}
                    className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500 text-black text-3xl font-bold border-4 border-gray-200">
                    {displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {displayName || 'Usuario'}
                  </h3>
                  <p className="text-gray-600">{userProfile.email}</p>
                </div>
              </div>

              {/* Edit Form */}
              {editing ? (
                <div className="space-y-4 border-t border-t pt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Visualización
                    </label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL de Foto de Perfil
                    </label>
                    <Input
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-600">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recently Read */}
        <Card className="">
          <CardHeader>
            <CardTitle>Lecturas Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-600">
                Cargando poemas leídos...
              </div>
            ) : readPoems.length > 0 ? (
              <div className="space-y-4">
                {readPoems.map((poem) => (
                  <Link
                    key={poem.id}
                    href={`/poem/${poem.id}`}
                    className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <h4 className="font-semibold text-gray-900">{poem.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">por {poem.author}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  Aún no has leído ningún poema
                </p>
                <Link href="/explore">
                  <Button>Explorar Poemas</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sign Out Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute fallback="redirect">
      <ProfileContent />
    </ProtectedRoute>
  );
}
