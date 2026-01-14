'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPoemById, addToFavorites, removeFromFavorites, markAsRead, isPoemFavorite } from '@/lib/firebase/poems';
import { useAuth } from '@/contexts/AuthContext';
import { Poem } from '@/types/poem';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

type ViewMode = 'text' | 'video' | 'music' | 'voice';

export default function PoemDetailPage() {
  const { addToast } = useToast();
  const params = useParams();
  const poemId = params.id as string;
  const { user, userProfile } = useAuth();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('text');
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  useEffect(() => {
    loadPoem();
    // Reset translation state when poem changes
    setShowTranslation(false);
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
      addToast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para agregar poemas a favoritos',
        variant: 'info',
      });
      return;
    }

    setTogglingFavorite(true);

    try {
      if (isFavorite) {
        await removeFromFavorites(userProfile.uid, poem.id);
        addToast({
          title: 'Eliminado de favoritos',
          description: `"${poem.title}" ya no está en tus favoritos`,
          variant: 'success',
        });
      } else {
        await addToFavorites(userProfile.uid, poem.id);
        addToast({
          title: 'Agregado a favoritos',
          description: `"${poem.title}" ha sido agregado a tus favoritos`,
          variant: 'success',
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      addToast({
        title: 'Error',
        description: 'Error al actualizar favoritos',
        variant: 'error',
      });
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
    <div className="min-h-screen bg-black py-6 sm:py-12 fade-in">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
                {poem.title}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/60">por {poem.author}</p>
            </div>

            {/* Favorite Button */}
            <Button
              onClick={handleToggleFavorite}
              disabled={togglingFavorite || !user}
              variant={isFavorite ? "outline" : "default"}
              className={`${isFavorite
                ? 'border-red-500/30 text-red-400 hover:bg-red-950/30'
                : 'bg-[#FFD700] text-black hover:bg-[#FFEC8B]'
              } ${!user ? 'w-full sm:w-auto' : ''}`}
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
              {poem.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-[#FFD700]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="mb-6 border-b border-white/10">
          <nav className="flex overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setViewMode('text')}
              className={`py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === 'text'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              📄 Lectura
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === 'video'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
              disabled={!poem.videoUrl}
            >
              🎬 Video
            </button>
            <button
              onClick={() => setViewMode('music')}
              className={`py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === 'music'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
              disabled={!poem.musicUrl}
            >
              🎵 Música
            </button>
            <button
              onClick={() => setViewMode('voice')}
              className={`py-3 px-3 sm:py-4 sm:px-4 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                viewMode === 'voice'
                  ? 'border-[#FFD700] text-[#FFD700]'
                  : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
              }`}
              disabled={!poem.voiceUrl}
            >
              🎙️ Voz
            </button>
          </nav>
        </div>

        {/* Content */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {viewMode === 'text' && (
              <div>
                {/* Translation button */}
                {poem.contentSpanish && (
                  <div className="mb-4 flex justify-end">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] rounded-lg transition-colors text-sm font-medium"
                    >
                      <span>🌐</span>
                      <span>{showTranslation ? 'Ver original' : 'Ver traducción'}</span>
                    </button>
                  </div>
                )}

                {/* Poem content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-base sm:text-lg text-white/90 whitespace-pre-wrap leading-relaxed">
                    {showTranslation && poem.contentSpanish ? poem.contentSpanish : poem.content}
                  </p>
                </div>

                {/* Language indicator */}
                {poem.originalLanguage && !showTranslation && (
                  <div className="mt-4 text-xs text-white/40">
                    Idioma original: {poem.originalLanguage === 'gl' ? 'Gallego' : poem.originalLanguage === 'en' ? 'Inglés' : poem.originalLanguage === 'fr' ? 'Francés' : poem.originalLanguage}
                  </div>
                )}
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
              <div className="text-center py-6 sm:py-8">
                <audio
                  src={poem.musicUrl}
                  controls
                  className="w-full"
                >
                  Tu navegador no soporta audio HTML5.
                </audio>
              </div>
            )}

            {viewMode === 'voice' && poem.voiceUrl && (
              <div className="text-center py-6 sm:py-8">
                <div className="mb-4">
                  <p className="text-xs sm:text-sm text-white/60 mb-4">🎙️ Narración del poema</p>
                </div>
                <audio
                  src={poem.voiceUrl}
                  controls
                  className="w-full"
                >
                  Tu navegador no soporta audio HTML5.
                </audio>
              </div>
            )}

            {viewMode !== 'text' && !poem[`${viewMode}Url`] && (
              <div className="text-center py-8 sm:py-12 text-white/60">
                <p className="text-sm sm:text-base">
                  {viewMode === 'video'
                    ? 'Video no disponible'
                    : viewMode === 'music'
                    ? 'Versión musicada no disponible'
                    : viewMode === 'voice'
                    ? 'Narración no disponible'
                    : 'Contenido no disponible'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-6 sm:mt-8">
          <Link href="/explore" className="block">
            <Button variant="outline" className="w-full sm:w-auto border-white/30 text-[#FFD700] hover:bg-white/10 hover:border-[#FFD700]/50">
              ← Volver a Explorar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
