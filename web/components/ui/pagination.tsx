'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showInfo = true,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startIndex = totalItems && itemsPerPage
    ? (currentPage - 1) * itemsPerPage + 1
    : null;
  const endIndex = totalItems && itemsPerPage
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
      {/* Info */}
      {showInfo && totalItems && itemsPerPage && startIndex && endIndex && (
        <div className="text-sm text-white/60">
          Mostrando {startIndex} - {endIndex} de {totalItems} elementos
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          className="bg-black text-white border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                onClick={() => onPageChange(page)}
                variant={page === currentPage ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'min-w-[2.5rem]',
                  page === currentPage
                    ? 'bg-[#FFD700] text-black hover:bg-[#FFEC8B]'
                    : 'bg-black text-white border-white/20 hover:bg-white/10'
                )}
              >
                {page}
              </Button>
            ) : (
              <span
                key={index}
                className="px-2 text-white/40"
              >
                {page}
              </span>
            )
          ))}
        </div>

        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          className="bg-black text-white border-white/20 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </Button>
      </div>
    </div>
  );
}
