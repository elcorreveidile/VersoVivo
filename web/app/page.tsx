'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getFeaturedPoems } from '@/lib/firebase/poems';
import { Poem } from '@/types/poem';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, userProfile } = useAuth();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedPoems();
  }, []);

  const loadFeaturedPoems = async () => {
    setLoading(true);
    const featured = await getFeaturedPoems(6);
    setPoems(featured);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] text-white border-b border-white/10">
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-[#FFD700]">
              VersoVivo
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70 sm:text-xl max-w-3xl mx-auto">
              Poesía que cobra vida a través del texto, el video y la música generada por IA
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/explore">
                <Button size="lg" className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
                  Explorar Poemas
                </Button>
              </Link>
              {user ? (
                <Link href="/profile">
                  <Button size="lg" className="bg-black/60 backdrop-blur-sm border border-white/20 text-[#FFD700] hover:bg-black/80 hover:border-[#FFD700]/50">
                    👋 Hola, {userProfile?.displayName?.split(' ')[0] || 'Usuario'}
                  </Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button size="lg" className="bg-black/60 backdrop-blur-sm border border-white/20 text-[#FFD700] hover:bg-black/80 hover:border-[#FFD700]/50">
                    Crear Cuenta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Poems Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Poemas Destacados
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Descubre nuestra selección de poemas más recientes
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : poems.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {poems.map((poem) => (
                <Link key={poem.id} href={`/poem/${poem.id}`}>
                  <Card className="card-hover cursor-pointer h-full bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30">
                    {poem.thumbnailUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-white/5">
                        <img
                          src={poem.thumbnailUrl}
                          alt={poem.title}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl text-white">{poem.title}</CardTitle>
                      <p className="text-sm text-white/60 mt-1">por {poem.author}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/60 line-clamp-3">
                        {poem.content ? poem.content.substring(0, 150) : 'Sin descripción'}...
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {poem.tags && poem.tags.length > 0 && poem.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-0.5 text-xs font-medium text-[#FFD700]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <p className="text-white/60">No hay poemas disponibles en este momento.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/explore">
              <Button size="lg" className="bg-black/60 backdrop-blur-sm border border-white/20 text-[#FFD700] hover:bg-black/80 hover:border-[#FFD700]/50">
                Ver Todos los Poemas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/5 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tres Formatos de Experiencia
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Lectura Inmersiva</h3>
              <p className="mt-2 text-base text-white/60">
                Texto con tipografía elegante y animaciones sutiles
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Recitación en Video</h3>
              <p className="mt-2 text-base text-white/60">
                Interpretación visual del poema por su autor
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Versión Musicada</h3>
              <p className="mt-2 text-base text-white/60">
                Adaptación musical generada con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
