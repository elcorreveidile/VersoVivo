'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPoemById, addToFavorites, removeFromFavorites, markAsRead } from '@/lib/firebase/poems';
import { Poem } from '@/types/poem';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function PoemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userProfile, refreshProfile } = useAuth();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'text' | 'video' | 'music'>('text');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [markedAsRead, setMarkedAsRead] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadPoem(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    // Check if poem is in favorites
    if (poem && userProfile) {
      setIsFavorite(userProfile.favoritePoems?.includes(poem.id) || false);
    }
  }, [poem, userProfile]);

  const loadPoem = async (id: string) => {
    setLoading(true);
    const loadedPoem = await getPoemById(id);
    setPoem(loadedPoem);

    // Mark as read if user is authenticated and not already marked
    if (loadedPoem && userProfile && !markedAsRead) {
      await markAsRead(userProfile.uid, loadedPoem.id);
      await refreshProfile();
      setMarkedAsRead(true);
    }

    setLoading(false);
  };

  const handleToggleFavorite = async () => {
    if (!poem || !userProfile) return;

    setFavoriteLoading(true);

    if (isFavorite) {
      const result = await removeFromFavorites(userProfile.uid, poem.id);
      if (result.error) {
        alert('Error al eliminar de favoritos: ' + result.error);
        setFavoriteLoading(false);
        return;
      }
      setIsFavorite(false);
    } else {
      const result = await addToFavorites(userProfile.uid, poem.id);
      if (result.error) {
        alert('Error al agregar a favoritos: ' + result.error);
        setFavoriteLoading(false);
        return;
      }
      setIsFavorite(true);
    }

    // Refresh profile to update counts
    await refreshProfile();
    setFavoriteLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-xl text-gray-600">Cargando poema...</div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Poema no encontrado</h1>
          <Link href="/explore">
            <Button className="mt-4">Volver a Explorar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/explore">
          <Button variant="outline" className="mb-6">
            ← Volver
          </Button>
        </Link>

        {/* Poem Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {poem.title}
          </h1>
          <p className="mt-2 text-xl text-gray-600">por {poem.author}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {poem.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setMode('text')}
              className={`border-b-2 py-4 px-1 text-sm font-medium ${
                mode === 'text'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Lectura
            </button>
            {poem.videoUrl && (
              <button
                onClick={() => setMode('video')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  mode === 'video'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Video
              </button>
            )}
            {poem.musicUrl && (
              <button
                onClick={() => setMode('music')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  mode === 'music'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Música
              </button>
            )}
          </nav>
        </div>

        {/* Mode Content */}
        <Card>
          <CardContent className="p-8">
            {mode === 'text' && (
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg font-serif">
                  {poem.content}
                </div>
              </div>
            )}

            {mode === 'video' && poem.videoUrl && (
              <div className="aspect-video w-full">
                <video
                  src={poem.videoUrl}
                  controls
                  className="w-full h-full rounded-lg"
                />
              </div>
            )}

            {mode === 'music' && poem.musicUrl && (
              <div className="text-center">
                <div className="mx-auto max-w-md">
                  <audio
                    src={poem.musicUrl}
                    controls
                    className="w-full"
                  />
                  <p className="mt-4 text-sm text-gray-600">
                    Versión musicada generada con inteligencia artificial
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            size="lg"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading || !user}
            className={isFavorite ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {favoriteLoading ? (
              'Cargando...'
            ) : isFavorite ? (
              '♥ Eliminar de Favoritos'
            ) : (
              '♡ Agregar a Favoritos'
            )}
          </Button>
          <Button size="lg" variant="outline">
            Compartir
          </Button>
          {!user && (
            <p className="w-full text-sm text-gray-600 mt-2">
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
              {' '}para guardar favoritos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
