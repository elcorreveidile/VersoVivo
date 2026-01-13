'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { getPoemByIdForAdmin, updatePoem, logActivity, getAllBooks } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function EditPoemContent() {
  const router = useRouter();
  const params = useParams();
  const poemId = params.id as string;
  const { user, userProfile } = useAuth();
  const [poem, setPoem] = useState<any | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    loadData();
  }, [poemId]);

  const loadData = async () => {
    setLoading(true);
    const [poemData, booksData] = await Promise.all([
      getPoemByIdForAdmin(poemId),
      getAllBooks()
    ]);

    if (!poemData) {
      setError('Poema no encontrado');
      setLoading(false);
      return;
    }

    setPoem(poemData);
    setBooks(booksData);
    setFormData({
      title: poemData.title || '',
      author: poemData.author || '',
      content: poemData.content || '',
      category: poemData.category || '',
      tags: poemData.tags ? poemData.tags.join(', ') : '',
      videoUrl: poemData.videoUrl || '',
      musicUrl: poemData.musicUrl || '',
      thumbnailUrl: poemData.thumbnailUrl || '',
      bookId: poemData.bookId || '',
    });
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.author.trim() || !formData.content.trim()) {
      setError('El título, autor y contenido son obligatorios');
      return;
    }

    setSaving(true);

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await updatePoem(poemId, {
        ...formData,
        tags: tagsArray,
        bookId: formData.bookId || undefined,
      });

      if (!result.success) {
        throw new Error(result.error || 'Error al actualizar poema');
      }

      // Log activity
      if (user && userProfile && poem) {
        await logActivity({
          adminId: user.uid,
          adminEmail: userProfile.email || user.email || '',
          action: 'update',
          resourceType: 'poem',
          resourceId: poemId,
          resourceTitle: formData.title,
          changes: {
            before: poem,
            after: formData
          },
        });
      }

      alert('Poema actualizado exitosamente');
      router.push('/admin/poems');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar poema');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-white/60 mt-4">Cargando poema...</p>
      </div>
    );
  }

  if (error && !poem) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
        <p className="text-white/60 mb-6">{error}</p>
        <Link href="/admin/poems">
          <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
            ← Volver a Poemas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Editar Poema</h1>
          <p className="text-white/60">Modifica los datos del poema</p>
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
                {books.map((book) => (
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
                />
                {formData.videoUrl && (
                  <p className="text-xs text-green-400 mt-1">✓ Video configurado</p>
                )}
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
                />
                {formData.musicUrl && (
                  <p className="text-xs text-green-400 mt-1">✓ Música configurada</p>
                )}
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
                />
                {formData.thumbnailUrl && (
                  <p className="text-xs text-green-400 mt-1">✓ Miniatura configurada</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
              <Link href="/admin/poems" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
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

export default function EditPoemPage() {
  return (
    <AdminRoute>
      <EditPoemContent />
    </AdminRoute>
  );
}
