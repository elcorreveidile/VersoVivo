'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminRoute from '@/components/auth/AdminRoute';
import { createBook, logActivity } from '@/lib/firebase/admin';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function NewBookContent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    price: 6.99,
    status: 'draft' as 'draft' | 'published' | 'archived',
    inSubscription: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim() || !formData.author.trim()) {
      setError('El título y el autor son obligatorios');
      return;
    }

    if (formData.price < 0) {
      setError('El precio no puede ser negativo');
      return;
    }

    setLoading(true);

    try {
      const result = await createBook({
        ...formData,
        poems: [],
        currency: 'EUR',
      });

      if (!result.success || !result.bookId) {
        throw new Error(result.error || 'Error al crear libro');
      }

      // Log activity
      if (user && userProfile) {
        await logActivity({
          adminId: user.uid,
          adminEmail: userProfile.email || user.email || '',
          action: 'create',
          resourceType: 'book',
          resourceId: result.bookId,
          resourceTitle: formData.title,
          changes: formData,
        });
      }

      alert('Libro creado exitosamente');
      router.push('/admin/books');
    } catch (err: any) {
      setError(err.message || 'Error al crear libro');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Nuevo Libro</h1>
          <p className="text-white/60">Completa los datos del libro</p>
        </div>
        <Link href="/admin/books">
          <Button variant="outline" className="bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black">
            ← Volver
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Información del Libro</CardTitle>
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
                Título del Libro *
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-[#FFD700] focus:outline-none"
                placeholder="Breve descripción del libro..."
              />
            </div>

            {/* Cover URL */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                URL de Portada
              </label>
              <Input
                type="url"
                value={formData.coverUrl}
                onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
                placeholder="https://ejemplo.com/portada.jpg"
              />
              <p className="text-xs text-white/40 mt-1">
                URL de la imagen de portada (opcional)
              </p>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Precio (€)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="draft" className="bg-black">Borrador</option>
                <option value="published" className="bg-black">Publicado</option>
                <option value="archived" className="bg-black">Archivado</option>
              </select>
            </div>

            {/* In Subscription */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="inSubscription"
                checked={formData.inSubscription}
                onChange={(e) => setFormData({ ...formData, inSubscription: e.target.checked })}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-[#FFD700] focus:ring-[#FFD700]"
              />
              <label htmlFor="inSubscription" className="text-sm text-white/80">
                Incluir en suscripción
              </label>
            </div>

            {/* Preview */}
            {formData.title && (
              <Card className="bg-[#FFD700]/5 border-[#FFD700]/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
                  <div className="flex items-start space-x-4">
                    {formData.coverUrl ? (
                      <img
                        src={formData.coverUrl}
                        alt={formData.title}
                        className="w-24 h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-32 bg-white/10 rounded flex items-center justify-center text-white/20">
                        📚
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-white">{formData.title || 'Título'}</h4>
                      <p className="text-white/60">{formData.author || 'Autor'}</p>
                      <div className="mt-2">
                        <span className="text-[#FFD700] font-semibold">€{formData.price.toFixed(2)}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                          formData.status === 'published'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : formData.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : 'bg-white/10 text-white/40 border-white/20'
                        }`}>
                          {formData.status === 'published' ? 'Publicado' : formData.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
              >
                {loading ? 'Creando...' : 'Crear Libro'}
              </Button>
              <Link href="/admin/books" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
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

export default function NewBookPage() {
  return (
    <AdminRoute>
      <NewBookContent />
    </AdminRoute>
  );
}
