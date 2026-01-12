'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserFavorites } from '@/lib/firebase/user';
import { removeFromFavorites } from '@/lib/firebase/poems';
import { Poem } from '@/types/poem';
import Link from 'next/link';

function FavoritesContent() {
  const { userProfile, refreshProfile } = useAuth();
  const [favorites, setFavorites] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, [userProfile]);

  const loadFavorites = async () => {
    if (!userProfile) return;

    setLoading(true);
    const favPoems = await getUserFavorites(userProfile.uid);
    setFavorites(favPoems);
    setLoading(false);
  };

  const handleRemoveFavorite = async (poemId: string) => {
    if (!userProfile) return;

    setRemoving(poemId);
    const result = await removeFromFavorites(userProfile.uid, poemId);

    if (result.error) {
      alert('Error al eliminar de favoritos: ' + result.error);
      setRemoving(null);
      return;
    }

    // Remove from local state
    setFavorites((prev) => prev.filter((p) => p.id !== poemId));
    await refreshProfile();
    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Mis Favoritos
            </h1>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Mis Favoritos
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {favorites.length} poem{favorites.length !== 1 ? 'as' : 'a'} favorita{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((poem) => (
              <Card key={poem.id} className="relative">
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFavorite(poem.id)}
                  disabled={removing === poem.id}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors shadow-sm"
                  title="Eliminar de favoritos"
                >
                  {removing === poem.id ? (
                    <div className="h-5 w-5 animate-pulse rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>

                {/* Poem Card */}
                <Link href={`/poem/${poem.id}`}>
                  {poem.thumbnailUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100">
                      <img
                        src={poem.thumbnailUrl}
                        alt={poem.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{poem.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">por {poem.author}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {poem.content ? poem.content.substring(0, 150) : 'Sin descripción'}...
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {poem.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-16">
            <CardContent>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 mb-6">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sin favoritos aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza a explorar y guarda tus poemas favoritos
              </p>
              <Link href="/explore">
                <Button size="lg">Explorar Poemas</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute fallback="redirect">
      <FavoritesContent />
    </ProtectedRoute>
  );
}
