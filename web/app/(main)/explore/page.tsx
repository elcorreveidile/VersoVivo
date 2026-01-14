'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getPoemsPaginated, searchPoems } from '@/lib/firebase/poems';
import { Poem } from '@/types/poem';
import { Pagination } from '@/components/ui/pagination';

export default function ExplorePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  useEffect(() => {
    loadPoems();
  }, [currentPage]);

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    } else {
      setFilteredPoems(poems);
    }
  }, [searchTerm, poems]);

  const loadPoems = async () => {
    setLoading(true);
    const result = await getPoemsPaginated(currentPage, itemsPerPage);
    setPoems(result.items);
    setFilteredPoems(result.items);
    setTotalPages(result.totalPages);
    setTotalItems(result.totalItems);
    setLoading(false);
  };

  const performSearch = async (term: string) => {
    if (term.trim() === '') {
      setFilteredPoems(poems);
    } else {
      const results = await searchPoems(term);
      setFilteredPoems(results);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black py-12 fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Explorar Poemas
          </h1>
          <p className="mt-2 text-lg text-white/60">
            Descubre nuestra colección completa de poemas
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            type="text"
            placeholder="Buscar por título, autor o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-2xl bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPoems.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-white/60">
              Mostrando {!searchTerm ? totalItems : filteredPoems.length} poem{(!searchTerm ? totalItems : filteredPoems.length) !== 1 ? 'as' : 'a'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPoems.map((poem) => (
                <Link key={poem.id} href={`/poem/${poem.id}`}>
                  <Card className="card-hover cursor-pointer h-full bg-white/5 border-white/10 backdrop-blur-sm hover:border-[#FFD700]/30">
                    {poem.thumbnailUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-white/5">
                        <img
                          src={poem.thumbnailUrl}
                          alt={poem.title}
                          className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl text-white">{poem.title}</CardTitle>
                      <p className="text-sm text-white/60 mt-1">por {poem.author}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-white/60 line-clamp-3">
                        {poem.content ? poem.content.substring(0, 150) : 'Sin descripción'}...
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {poem.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 px-2.5 py-0.5 text-xs font-medium text-[#FFD700]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && !searchTerm && (
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
          <div className="text-center py-12">
            <p className="text-lg text-white/60">
              {searchTerm ? 'No se encontraron poemas que coincidan con tu búsqueda.' : 'No hay poemas disponibles.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
