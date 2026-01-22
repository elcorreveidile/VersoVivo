'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getPublishedBooks, getBookWithPoems } from '@/lib/firebase/books';
import { Book, Poem } from '@/types/poem';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, userProfile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [poemsMap, setPoemsMap] = useState<Map<string, Poem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const booksData = await getPublishedBooks();
    setBooks(booksData);

    // Cargar poemas para cada libro
    const poemsPromises = booksData.map(async (book) => {
      const { poems } = await getBookWithPoems(book.id);
      return { bookId: book.id, poems };
    });

    const poemsResults = await Promise.all(poemsPromises);
    const newPoemsMap = new Map<string, Poem[]>();
    poemsResults.forEach(({ bookId, poems }) => {
      newPoemsMap.set(bookId, poems);
    });
    setPoemsMap(newPoemsMap);
    setLoading(false);
  };

  const toggleBook = (bookId: string) => {
    setExpandedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
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
                    Crear cuenta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Libros publicados
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Explora nuestra colección de libros de poesía
            </p>
          </div>

          {loading ? (
            <div className="mt-12 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-lg h-32"></div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-white/60">No hay libros disponibles en este momento.</p>
            </div>
          ) : (
            <div className="mt-12 space-y-4">
              {books.map((book) => {
                const poems = poemsMap.get(book.id) || [];
                const isExpanded = expandedBooks.has(book.id);
                const poemCount = poems.length;

                return (
                  <div key={book.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    {/* Book Header - Clickable */}
                    <button
                      onClick={() => toggleBook(book.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {book.coverUrl && (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 text-left">
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {book.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <span>por {book.author}</span>
                            <span>•</span>
                            <span>{poemCount} {poemCount === 1 ? 'poema' : 'poemas'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-white/60">
                        {isExpanded ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* Poems List - Expanded */}
                    {isExpanded && (
                      <div className="border-t border-white/10">
                        {poems.length === 0 ? (
                          <div className="px-6 py-8 text-center text-white/60">
                            Este libro no tiene poemas aún
                          </div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {poems.map((poem, index) => (
                              <Link
                                key={poem.id}
                                href={`/poem/${poem.id}`}
                                className="block hover:bg-white/5 transition-colors"
                              >
                                <div className="px-6 py-4 flex items-start gap-4">
                                  <span className="text-[#FFD700] text-sm font-medium pt-1">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-medium text-white mb-1">
                                      {poem.title}
                                    </h4>
                                    <p className="text-sm text-white/60 line-clamp-2">
                                      {poem.content.substring(0, 100)}...
                                    </p>
                                  </div>
                                  <div className="text-white/40">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link href="/explore">
              <Button size="lg" className="bg-black/60 backdrop-blur-sm border border-white/20 text-[#FFD700] hover:bg-black/80 hover:border-[#FFD700]/50">
                Explorar todos los libros
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
              Tres formatos de experiencia
            </h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Lectura inmersiva</h3>
              <p className="mt-2 text-base text-white/60">
                Poemas con versiones traducidas y texto original
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Poema musicado</h3>
              <p className="mt-2 text-base text-white/60">
                Poemas convertidos en canción con videoclip
              </p>
            </div>

            <div className="text-center group">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-white">Versión recitada</h3>
              <p className="mt-2 text-base text-white/60">
                Poemas leídos por su autor, locutores, actores u otros poetas
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
