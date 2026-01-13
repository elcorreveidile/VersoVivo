'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { createPoem, logActivity, getAllBooks } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function NewPoemContent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [books, setBooks] = useState<any[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    category: '',
    tags: '',
    videoUrl: '',
    musicUrl: '',
    thumbnailUrl: '',
    bookId: '',
  });

  useState(() => {
    // Load books on mount
    getAllBooks().then(setBooks).finally(() => setLoadingBooks(false));
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    const booksData = await getAllBooks();
    setBooks(booksData);
  };

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
        duration: undefined,
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

      alert('Poema creado exitosamente');
      router.push('/admin/poems');
    } catch (err: any) {
      setError(err.message || 'Error al crear poema');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Nuevo Poema</h1>
          <p className="text-white/60">Completa los datos del poema</p>
        </div>
        <Link href="/admin/poems">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-[#FFD700] focus:outline-none"
                placeholder="Escribe el poema aquí..."
              />
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="" className="bg-black">Sin libro</option>
                {!loadingBooks && books.map((book) => (
                  <option key={book.id} value={book.id} className="bg-black">
                    {book.title}
                  </option>
                ))}
              </select>
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
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
                className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
              >
                {loading ? 'Creando...' : 'Crear Poema'}
              </Button>
              <Link href="/admin/poems" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full border-white/20 text-white hover:bg-white/10"
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
