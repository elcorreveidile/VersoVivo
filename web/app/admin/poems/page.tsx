'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getAllPoemsForAdmin, deletePoem, getAllBooks } from '@/lib/firebase/admin';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function PoemsContent() {
  const [poems, setPoems] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBook, setFilterBook] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const poemsData = await getAllPoemsForAdmin();
    const booksData = await getAllBooks();
    setPoems(poemsData);
    setBooks(booksData);
    setLoading(false);
  };

  const handleDelete = async (poemId: string, poemTitle: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar el poema "${poemTitle}"?\n\nEsta acción NO se puede deshacer.`
    );

    if (!confirmed) return;

    setDeleting(poemId);
    const result = await deletePoem(poemId);

    if (result.error) {
      alert('Error al eliminar poema: ' + result.error);
      setDeleting(null);
      return;
    }

    // Remove from local state
    setPoems((prev) => prev.filter((p) => p.id !== poemId));
    setDeleting(null);
  };

  const getBookTitle = (bookId: string) => {
    if (!bookId) return 'Sin libro';
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'Libro no encontrado';
  };

  const filteredPoems = poems.filter((poem) => {
    const matchesSearch =
      poem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBook = filterBook === 'all' || poem.bookId === filterBook;
    return matchesSearch && matchesBook;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Poemas</h1>
          <p className="text-white/60">{poems.length} poema{poems.length !== 1 ? 's' : ''} en total</p>
        </div>
        <Link href="/admin/poems/new">
          <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
            + Crear Poema
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
            <div>
              <select
                value={filterBook}
                onChange={(e) => setFilterBook(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[#FFD700] focus:outline-none"
              >
                <option value="all" className="bg-black">Todos los libros</option>
                {books.map((book) => (
                  <option key={book.id} value={book.id} className="bg-black">
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Poems Grid */}
      {loading ? (
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
      ) : filteredPoems.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPoems.map((poem) => (
            <Card key={poem.id} className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30 transition-all">
              <CardContent className="p-6">
                {/* Title and Author */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{poem.title}</h3>
                  <p className="text-sm text-white/60">por {poem.author}</p>
                </div>

                {/* Multimedia indicators */}
                <div className="flex gap-2 mb-4">
                  {poem.content && (
                    <span className="inline-flex items-center text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                      📄 Texto
                    </span>
                  )}
                  {poem.videoUrl && (
                    <span className="inline-flex items-center text-xs bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">
                      🎬 Video
                    </span>
                  )}
                  {poem.musicUrl && (
                    <span className="inline-flex items-center text-xs bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">
                      🎵 Música
                    </span>
                  )}
                  {poem.voiceUrl && (
                    <span className="inline-flex items-center text-xs bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded">
                      🎙️ Voz
                    </span>
                  )}
                  {poem.thumbnailUrl && (
                    <span className="inline-flex items-center text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                      🖼️ Miniatura
                    </span>
                  )}
                </div>

                {/* Content preview */}
                {poem.content && (
                  <div className="mb-4 text-sm text-white/40 line-clamp-3">
                    {poem.content.substring(0, 120)}...
                  </div>
                )}

                {/* Book association */}
                <div className="mb-4 text-sm">
                  <span className="text-white/60">Libro: </span>
                  <span className="text-white font-medium">{getBookTitle(poem.bookId)}</span>
                </div>

                {/* Tags */}
                {poem.tags && poem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {poem.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-2 py-1 text-xs font-medium text-[#FFD700]"
                      >
                        {tag}
                      </span>
                    ))}
                    {poem.tags.length > 3 && (
                      <span className="text-xs text-white/40">+{poem.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/admin/poems/edit/${poem.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-black text-[#FFD700] border-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                    >
                      Editar
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDelete(poem.id, poem.title)}
                    disabled={deleting === poem.id}
                    variant="outline"
                    size="sm"
                    className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  >
                    {deleting === poem.id ? '...' : 'Eliminar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterBook !== 'all' ? 'No se encontraron poemas' : 'No hay poemas aún'}
            </h3>
            <p className="text-white/60 mb-6">
              {searchTerm || filterBook !== 'all'
                ? 'Prueba con otros filtros'
                : 'Crea tu primer poema para empezar'}
            </p>
            {!searchTerm && filterBook === 'all' && (
              <Link href="/admin/poems/new">
                <Button className="bg-[#FFD700] text-black hover:bg-[#FFEC8B]">
                  + Crear Primer Poema
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function PoemsPage() {
  return (
    <AdminRoute>
      <PoemsContent />
    </AdminRoute>
  );
}
