'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPoemById, addToFavorites, removeFromFavorites, markAsRead, isPoemFavorite } from '@/lib/firebase/poems';
import { useAuth } from '@/contexts/AuthContext';
import { Poem } from '@/types/poem';
import Link from 'next/link';

type ViewMode = 'text' | 'video' | 'music';

export default function PoemDetailPage() {
  const params = useParams();
  const poemId = params.id as string;
  const { user, userProfile } = useAuth();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('text');
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    loadPoem();
  }, [poemId]);

  useEffect(() => {
    if (poem && user && userProfile) {
      checkFavoriteStatus();
      markAsRead(userProfile.uid, poem.id);
    }
  }, [poem, user, userProfile]);

  const loadPoem = async () => {
    setLoading(true);
    const poemData = await getPoemById(poemId);
    setPoem(poemData);
    setLoading(false);
  };

  const checkFavoriteStatus = async () => {
    if (!userProfile) return;
    const favorite = await isPoemFavorite(userProfile.uid, poemId);
    setIsFavorite(favorite);
  };

  const handleToggleFavorite = async () => {
    if (!user || !userProfile || !poem) {
      alert('Debes iniciar sesión para agregar poemas a favoritos');
      return;
    }

    setTogglingFavorite(true);

    try {
      if (isFavorite) {
        await removeFromFavorites(userProfile.uid, poem.id);
      } else {
        await addToFavorites(userProfile.uid, poem.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error al actualizar favoritos');
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Poema no encontrado</h1>
          <Link href="/explore">
            <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
              Volver a Explorar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                {poem.title}
              </h1>
              <p className="text-xl text-white/60">por {poem.author}</p>
            </div>

            {/* Favorite Button */}
            <Button
              onClick={handleToggleFavorite}
              disabled={togglingFavorite || !user}
              variant={isFavorite ? "outline" : "default"}
              className={`ml-4 ${isFavorite
                ? 'border-red-500/30 text-red-400 hover:bg-red-950/30'
                : 'bg-[#FFD700] text-black hover:bg-[#FFEC8B]'
              }`}
            >
              {togglingFavorite ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  {isFavorite ? '♥ Eliminar' : '♡ Favorito'}
                </>
              )}
            </Button>
          </div>

          {/* Tags */}
          {poem.tags && poem.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {poem.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-3 py-1 text-sm font-medium text-[#FFD700]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 border-b border-white/10">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('text')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'text'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              Lectura
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'video'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
              disabled={!poem.videoUrl}
            >
              Video
            </button>
            <button
              onClick={() => setViewMode('music')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'music'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
              disabled={!poem.musicUrl}
            >
              Música
            </button>
          </nav>
        </div>

        {/* Content */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8">
            {viewMode === 'text' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-white/90 whitespace-pre-wrap leading-relaxed">
                  {poem.content}
                </p>
              </div>
            )}

            {viewMode === 'video' && poem.videoUrl && (
              <div className="aspect-video w-full">
                <video
                  src={poem.videoUrl}
                  controls
                  className="w-full h-full rounded-lg"
                >
                  Tu navegador no soporta video HTML5.
                </video>
              </div>
            )}

            {viewMode === 'music' && poem.musicUrl && (
              <div className="text-center py-8">
                <audio
                  src={poem.musicUrl}
                  controls
                  className="w-full"
                >
                  Tu navegador no soporta audio HTML5.
                </audio>
              </div>
            )}

            {viewMode !== 'text' && !poem[`${viewMode}Url`] && (
              <div className="text-center py-12 text-white/60">
                <p>
                  {viewMode === 'video'
                    ? 'Video no disponible'
                    : 'Versión musicada no disponible'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/explore">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-[#FFD700]">
              ← Volver a Explorar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
