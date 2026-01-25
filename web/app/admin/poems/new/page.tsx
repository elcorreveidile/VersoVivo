'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '@/components/auth/AdminRoute';
import { createPoem, logActivity, getAllBooks } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import { Book } from '@/types/poem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useToast } from '@/components/ui/toast';

function NewPoemContent() {
  const { addToast } = useToast();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    category: '',
    tags: '',
    videoUrl: '',
    musicUrl: '',
    voiceUrl: '',
    thumbnailUrl: '',
    bookId: '',
    contentSpanish: '',
    originalLanguage: '',
  });

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await getAllBooks();
      setBooks(booksData);
      setLoadingBooks(false);
    };
    loadBooks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
      setError('El título, autor y contenido son obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await createPoem({
        ...formData,
        tags: tagsArray,
        bookId: formData.bookId || undefined,
      });

      if (!result.success || !result.poemId) {
        throw new Error(result.error || 'Error al crear poema');
      }

      // Log activity
      if (user && userProfile) {
        await logActivity({
          adminId: user.uid,
          adminEmail: userProfile.email || user.email || '',
          action: 'create',
          resourceType: 'poem',
          resourceId: result.poemId,
          resourceTitle: formData.title,
          changes: formData,
        });
      }

      addToast({
        title: 'Poema creado',
        description: `"${formData.title}" ha sido creado exitosamente`,
        variant: 'success',
      });
      router.push('/admin/poems');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al crear poema';
      setError(errorMsg);
      addToast({
        title: 'Error al crear poema',
        description: errorMsg,
        variant: 'error',
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear nuevo poema</h1>
          <p className="text-white/60">Completa los datos del poema</p>
        </div>
        <Link href="/admin/poems">
          <Button variant="outline" className="bg-black text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black">
            ← Volver
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Información del Poema</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500/30 text-red-200 p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Título del Poema *
              </label>
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                placeholder="Ej: Versos sencillos para despistar a la poesía"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Autor *
              </label>
              <Input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                placeholder="Ej: Javier Benítez Láinez"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Contenido del Poema *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={10}
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent)] focus:outline-none"
                placeholder="Escribe el poema aquí..."
              />
            </div>

            {/* Translation Section */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-lg font-semibold text-white">🌐 Traducción (Opcional)</h3>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Idioma Original
                </label>
                <select
                  value={formData.originalLanguage}
                  onChange={(e) => setFormData({ ...formData, originalLanguage: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
                >
                  <option value="" className="bg-black">Español (sin traducción)</option>
                  <option value="gl" className="bg-black">Gallego</option>
                  <option value="en" className="bg-black">Inglés</option>
                  <option value="fr" className="bg-black">Francés</option>
                  <option value="pt" className="bg-black">Portugués</option>
                  <option value="de" className="bg-black">Alemán</option>
                  <option value="it" className="bg-black">Italiano</option>
                  <option value="other" className="bg-black">Otro</option>
                </select>
                <p className="text-xs text-white/40 mt-1">
                  Selecciona el idioma del texto original arriba
                </p>
              </div>

              {formData.originalLanguage && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Traducción al Español
                  </label>
                  <textarea
                    value={formData.contentSpanish}
                    onChange={(e) => setFormData({ ...formData, contentSpanish: e.target.value })}
                    rows={10}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-[var(--accent)] focus:outline-none"
                    placeholder="Pega aquí la traducción del poema al español..."
                  />
                  <p className="text-xs text-white/40 mt-1">
                    Los usuarios podrán alternar entre el texto original y la traducción
                  </p>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Categoría
              </label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                placeholder="Ej: Amor, Naturaleza, Tiempo..."
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Etiquetas
              </label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                placeholder="amor, memoria, tiempo (separadas por comas)"
              />
              <p className="text-xs text-white/40 mt-1">
                Separa las etiquetas con comas
              </p>
            </div>

            {/* Book Association */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Libro (opcional)
              </label>
              <select
                value={formData.bookId}
                onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
              >
                <option value="" className="bg-black">Sin libro</option>
                {!loadingBooks && books
                  .sort((a, b) => {
                    // Prioritize books by the same author as the poem
                    const poemAuthor = formData.author?.toLowerCase().trim();
                    const aAuthor = a.author?.toLowerCase().trim();
                    const bAuthor = b.author?.toLowerCase().trim();

                    const aMatches = aAuthor === poemAuthor;
                    const bMatches = bAuthor === poemAuthor;

                    if (aMatches && !bMatches) return -1;
                    if (!aMatches && bMatches) return 1;
                    return 0;
                  })
                  .map((book, index, sortedBooks) => {
                    const poemAuthor = formData.author?.toLowerCase().trim();
                    const bookAuthor = book.author?.toLowerCase().trim();
                    const isSameAuthor = bookAuthor === poemAuthor;
                    const prevBook = index > 0 ? sortedBooks[index - 1] : null;
                    const prevWasSameAuthor = prevBook ? prevBook.author?.toLowerCase().trim() === poemAuthor : false;

                    // Add separator before first non-matching book
                    const showSeparator = isSameAuthor === false && prevWasSameAuthor === true;

                    return (
                      <React.Fragment key={book.id}>
                        {showSeparator && (
                          <option disabled className="bg-black/50 text-white/40">
                            ──────────
                          </option>
                        )}
                        <option value={book.id} className="bg-black">
                          {book.title} {isSameAuthor ? '✓' : ''} {book.author ? `(${book.author})` : ''}
                        </option>
                      </React.Fragment>
                    );
                  })}
              </select>
              <p className="text-xs text-white/40 mt-1">
                {formData.author && books.some(b => b.author?.toLowerCase().trim() === formData.author.toLowerCase().trim())
                  ? `✓ Libros de "${formData.author}" aparecen primero`
                  : 'Escribe un autor para ver sus libros primero'}
              </p>
            </div>

            {/* Multimedia URLs */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white">Contenido Multimedia (Opcional)</h3>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🎬 URL del Video
                </label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                  placeholder="https://firebasestorage.app/..."
                />
                <p className="text-xs text-white/40 mt-1">
                  Pega el enlace desde Firebase Storage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🎵 URL de la Música
                </label>
                <Input
                  type="url"
                  value={formData.musicUrl}
                  onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                  placeholder="https://firebasestorage.app/..."
                />
                <p className="text-xs text-white/40 mt-1">
                  Pega el enlace desde Firebase Storage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🎙️ URL de la Voz (narración)
                </label>
                <Input
                  type="url"
                  value={formData.voiceUrl}
                  onChange={(e) => setFormData({ ...formData, voiceUrl: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                  placeholder="https://firebasestorage.app/..."
                />
                <p className="text-xs text-white/40 mt-1">
                  Pega el enlace desde Firebase Storage
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  🖼️ URL de Miniatura
                </label>
                <Input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
                  placeholder="https://firebasestorage.app/..."
                />
                <p className="text-xs text-white/40 mt-1">
                  Pega el enlace desde Firebase Storage
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[var(--accent)] text-black hover:bg-[#FFEC8B]"
              >
                {loading ? 'Creando...' : 'Crear poema'}
              </Button>
              <Link href="/admin/poems" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full bg-black text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
                >
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewPoemPage() {
  return (
    <AdminRoute>
      <NewPoemContent />
    </AdminRoute>
  );
}
