'use client';

import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemLabel?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemLabel = 'items' }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page numbers: 1 ... 3 4 5 ... 10
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-2.5 py-1.5 text-xs rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        &laquo;
      </button>
      {getPageNumbers().map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-500 text-xs">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'px-2.5 py-1.5 text-xs rounded-md border transition-colors',
              currentPage === p
                ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
                : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-2.5 py-1.5 text-xs rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        &raquo;
      </button>
      {totalItems !== undefined && (
        <span className="ml-3 text-gray-500 text-xs">
          {totalItems} {itemLabel}
        </span>
      )}
    </div>
  );
}

/** Helper hook for pagination state */
export function usePagination(totalItems: number, perPage: number) {
  const totalPages = Math.ceil(totalItems / perPage);
  return {
    totalPages,
    getPageItems: <T,>(items: T[], currentPage: number): T[] => {
      const start = (currentPage - 1) * perPage;
      return items.slice(start, start + perPage);
    },
  };
}
