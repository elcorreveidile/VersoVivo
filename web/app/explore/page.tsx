'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getPublishedBooks } from '@/lib/firebase/books';
import { getBookWithPoems } from '@/lib/firebase/books';
import { Book, Poem } from '@/types/poem';

export default function ExplorePage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Explorar
          </h1>
          <p className="text-white/60">
            Descubre poemas organizados por libros
          </p>
        </div>

        {/* Books List */}
        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No hay contenido disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
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
                        <h2 className="text-lg font-semibold text-white mb-1">
                          {book.title}
                        </h2>
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
                                  <h3 className="text-base font-medium text-white mb-1">
                                    {poem.title}
                                  </h3>
                                  <p className="text-sm text-white/60 line-clamp-2">
                                    {poem.content.substring(0, 100)}...
                                  </p>
                                  {poem.tags && poem.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
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
      </div>
    </div>
  );
}
