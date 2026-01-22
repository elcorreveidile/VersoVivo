'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBookWithPoems } from '@/lib/firebase/books';
import { Book, Poem } from '@/types/poem';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [book, setBook] = useState<Book | null>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    setLoading(true);
    const data = await getBookWithPoems(bookId);
    setBook(data.book);
    setPoems(data.poems);
    setLoading(false);

    if (!data.book) {
      setError('Libro no encontrado');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-3/4"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Libro no encontrado</h1>
          <Link href="/books">
            <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
              ← Volver a Libros
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/books">
            <Button variant="outline" className="border-white/30 text-[#FFD700] hover:bg-white/10 hover:border-[#FFD700]/50">
              ← Volver a Libros
            </Button>
          </Link>
        </div>

        {/* Book Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-8">
            {book.coverUrl && (
              <div className="flex-shrink-0">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full sm:w-48 rounded-lg shadow-2xl"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {book.title}
              </h1>
              <p className="text-xl text-white/60 mb-4">por {book.author}</p>
              <p className="text-white/80 leading-relaxed mb-4">
                {book.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                {book.inSubscription && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg">
                    <span>⭐</span>
                    <span>Incluido en suscripción</span>
                  </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <span>📝</span>
                  <span>{poems.length} poemas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Poems List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-4">Poemas del Libro</h2>

          {poems.length === 0 ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <p className="text-white/60">Este libro aún no tiene poemas asociados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {poems.map((poem, index) => (
                <Link key={poem.id} href={`/poem/${poem.id}`}>
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[#FFD700] text-sm font-medium">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className="text-xl font-semibold text-white group-hover:text-[#FFD700] transition-colors">
                              {poem.title}
                            </h3>
                          </div>
                          <p className="text-white/60 text-sm line-clamp-2">
                            {poem.content ? poem.content.substring(0, 150) + '...' : 'Sin contenido'}
                          </p>
                          {poem.tags && poem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {poem.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-[#FFD700]">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
