'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getAllBooks, deleteBook } from '@/lib/firebase/admin';
import { Book } from '@/types/poem';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const data = await getAllBooks();
    setBooks(data);
    setLoading(false);
  };

  const handleDelete = async (bookId: string, bookTitle: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el libro "${bookTitle}"?\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(bookId);
    const result = await deleteBook(bookId);

    if (result.error) {
      alert('Error al eliminar libro: ' + result.error);
      setDeleting(null);
      return;
    }

    // Remove from local state
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setDeleting(null);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Book['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'draft':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'archived':
        return 'bg-white/10 text-white/40 border-white/20';
      default:
        return 'bg-white/10 text-white/40 border-white/20';
    }
  };

  const getStatusLabel = (status: Book['status']) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Borrador';
      case 'archived':
        return 'Archivado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Libros</h1>
            <p className="text-white/60">Cargando libros...</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-white/10 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Libros</h1>
          <p className="text-white/60">{books.length} libro{books.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/admin/books/new">
          <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
            + Crear Libro
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por título o autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'published'
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Publicados
              </button>
              <button
                onClick={() => setFilterStatus('draft')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === 'draft'
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Borradores
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all">
              <CardContent className="p-6">
                {/* Cover and basic info */}
                <div className="flex items-start space-x-4 mb-4">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-white/10 rounded flex items-center justify-center text-white/20">
                      📚
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{book.title}</h3>
                    <p className="text-sm text-white/60">{book.author}</p>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getStatusColor(book.status)}`}>
                        {getStatusLabel(book.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Precio:</span>
                    <span className="text-[#FFD700] font-semibold">€{book.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Poemas:</span>
                    <span className="text-white">{book.poems?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Suscripción:</span>
                    <span className={`font-medium ${book.inSubscription ? 'text-green-400' : 'text-white/40'}`}>
                      {book.inSubscription ? 'Sí' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/admin/books/edit/${book.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white/20 text-white hover:bg-white/10 hover:text-[#FFD700]"
                    >
                      Editar
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(book.id, book.title)}
                    disabled={deleting === book.id}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  >
                    {deleting === book.id ? '...' : 'Eliminar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterStatus !== 'all' ? 'No se encontraron libros' : 'No hay libros aún'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Prueba con otros filtros'
                : 'Crea tu primer libro para empezar'}
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link href="/admin/books/new">
                <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
                  + Crear Primer Libro
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function BooksPage() {
  return (
    <AdminRoute>
      <BooksContent />
    </AdminRoute>
  );
}
