'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublishedBooks } from '@/lib/firebase/books';
import { Book } from '@/types/poem';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const booksData = await getPublishedBooks();
    setBooks(booksData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded w-1/4 mx-auto"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Button
            onClick={loadBooks}
            className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            📚 Libros publicados
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Explora nuestra colección de libros de poesía, cada uno con una selección curada de poemas
          </p>
        </div>

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No hay libros publicados todavía</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="group"
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all h-full">
                  {book.coverUrl && (
                    <div className="relative aspect-[2/3] w-2/3 mx-auto overflow-hidden rounded-t-lg">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-xl group-hover:text-[#FFD700] transition-colors">
                      {book.title}
                    </CardTitle>
                    <p className="text-white/60 text-sm">por {book.author}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 text-sm line-clamp-3 mb-4">
                      {book.description}
                    </p>
                    <div className="flex flex-col gap-3">
                      {book.inSubscription && (
                        <div className="flex items-center gap-2 text-xs text-[#FFD700]">
                          <span>⭐</span>
                          <span>Disponible con suscripción</span>
                        </div>
                      )}
                      {book.pdfUrl && (
                        <a
                          href={book.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-red-300 hover:text-red-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Descargar PDF</span>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Back to Explore */}
        <div className="mt-12 text-center">
          <Link href="/explore">
            <Button variant="outline" className="border-white/30 text-[#FFD700] hover:bg-white/10 hover:border-[#FFD700]/50">
              ← Volver a Explorar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
