'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getAllPoems, searchPoems } from '@/lib/firebase/poems';
import { Poem } from '@/types/poem';

export default function ExplorePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoems();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      performSearch(searchTerm);
    } else {
      setFilteredPoems(poems);
    }
  }, [searchTerm, poems]);

  const loadPoems = async () => {
    setLoading(true);
    const allPoems = await getAllPoems();
    setPoems(allPoems);
    setFilteredPoems(allPoems);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Explorar Poemas
          </h1>
          <p className="mt-2 text-lg text-gray-600">
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
            className="max-w-2xl"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPoems.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Mostrando {filteredPoems.length} poem{filteredPoems.length !== 1 ? 'as' : 'a'}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPoems.map((poem) => (
                <Link key={poem.id} href={`/poem/${poem.id}`}>
                  <Card className="transition-shadow hover:shadow-lg cursor-pointer h-full">
                    {poem.thumbnailUrl && (
                      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gray-100">
                        <img
                          src={poem.thumbnailUrl}
                          alt={poem.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">{poem.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">por {poem.author}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {poem.content ? poem.content.substring(0, 150) : 'Sin descripción'}...
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {poem.tags?.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
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
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              {searchTerm ? 'No se encontraron poemas que coincidan con tu búsqueda.' : 'No hay poemas disponibles.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
