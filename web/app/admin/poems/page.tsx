'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { getPoemsPaginated, deletePoem, getAllBooks } from '@/lib/firebase/admin';
import { Poem, Book } from '@/types/poem';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/toast';

function PoemsContent() {
  const { addToast } = useToast();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBook, setFilterBook] = useState<string>('all');
  const [filterNoContent, setFilterNoContent] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    setLoading(true);
    const result = await getPoemsPaginated(currentPage, itemsPerPage);
    const booksData = await getAllBooks();
    setPoems(result.items);
    setBooks(booksData);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
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
      addToast({
        title: 'Error al eliminar poema',
        description: result.error,
        variant: 'error',
      });
      setDeleting(null);
      return;
    }

    // Remove from local state
    setPoems((prev) => prev.filter((p) => p.id !== poemId));
    setDeleting(null);

    addToast({
      title: 'Poema eliminado',
      description: `"${poemTitle}" ha sido eliminado correctamente`,
      variant: 'success',
    });
  };

  const getBookTitle = (bookId: string | undefined) => {
    if (!bookId) return 'Sin libro';
    const book = books.find(b => b.id === bookId);
    return book ? book.title : 'Libro no encontrado';
  };

  const filteredPoems = poems.filter((poem) => {
    const matchesSearch =
      searchTerm === '' ||
      poem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBook = filterBook === 'all' || poem.bookId === filterBook;
    const matchesContent = !filterNoContent || !poem.content;

    return matchesSearch && matchesBook && matchesContent;
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Poemas</h1>
          <p className="text-white/60">
            {poems.length} poema{poems.length !== 1 ? 's' : ''} en total
            {poems.filter(p => !p.content).length > 0 && (
              <span className="ml-3 text-red-400">
                ⚠️ {poems.filter(p => !p.content).length} sin contenido
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setFilterNoContent(!filterNoContent)}
            variant={filterNoContent ? "default" : "outline"}
            className={filterNoContent
              ? "bg-red-600 text-white hover:bg-red-700 border-red-600"
              : "border-red-500/30 text-red-400 hover:bg-red-950/30"
            }
          >
            {filterNoContent ? '✓ Mostrando sin contenido' : '⚠️ Ver sin contenido'}
          </Button>
          <Link href="/admin/poems/new">
            <Button className="bg-[var(--accent)] text-black hover:bg-[#FFEC8B]">
              + Crear poema
            </Button>
          </Link>
        </div>
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
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <select
                value={filterBook}
                onChange={(e) => setFilterBook(e.target.value)}
                className="w-full sm:w-48 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-[var(--accent)] focus:outline-none"
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
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPoems.map((poem) => {
              const hasNoContent = !poem.content;
              return (
                <Card
                  key={poem.id}
                  className={`bg-white/5 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-all ${
                    hasNoContent
                      ? 'border-2 border-red-500/50 hover:border-red-500'
                      : 'border-white/10'
                  }`}
                >
                  <CardContent className="p-6">
                    {hasNoContent && (
                      <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>SIN CONTENIDO</span>
                        </div>
                        <p className="text-xs text-red-300 mt-1">Este poema necesita el texto del poema</p>
                      </div>
                    )}

                    {/* Title and Author */}
                    <div className="mb-4">
                      <h3 className={`text-lg font-semibold mb-1 ${hasNoContent ? 'text-red-400' : 'text-white'}`}>
                        {poem.title}
                      </h3>
                      <p className="text-sm text-white/60">por {poem.author}</p>
                    </div>

                    {/* Multimedia indicators */}
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {poem.content && (
                        <span className="inline-flex items-center text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                          📄 Texto
                        </span>
                      )}
                      {!poem.content && (
                        <span className="inline-flex items-center text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                          ❌ Sin texto
                        </span>
                      )}
                      {poem.videoUrl && (
                        <span className="inline-flex items-center text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
                          🎬 Video
                        </span>
                      )}
                      {poem.musicUrl && (
                        <span className="inline-flex items-center text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
                          🎵 Música
                        </span>
                      )}
                      {poem.voiceUrl && (
                        <span className="inline-flex items-center text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
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
                          className="inline-flex items-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2 py-1 text-xs font-medium text-[var(--accent)]"
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
                        className="w-full bg-black text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
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
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && !searchTerm && filterBook === 'all' && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
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
                <Button className="bg-[var(--accent)] text-black hover:bg-[#FFEC8B]">
                  + Crear primer poema
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
