'use client';

import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemLabel?: string;
  /** Show info text like "Showing 1-10 of 100 items" */
  showInfo?: boolean;
  /** Items per page for info text */
  itemsPerPage?: number;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemLabel = 'items',
  showInfo = false,
  itemsPerPage = 10,
  size = 'md',
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const buttonSize = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

  // Build page numbers with smart ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | '...')[] = [1];

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Info text */}
      {showInfo && totalItems !== undefined && (
        <span className="text-[#6b6b6b] text-sm">
          Showing <span className="text-white font-medium">{startItem}-{endItem}</span> of{' '}
          <span className="text-white font-medium">{totalItems}</span> {itemLabel}
        </span>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={cn(
            buttonSize,
            'flex items-center justify-center rounded-lg transition-colors',
            'bg-[#1a1a1f] text-[#6b6b6b]',
            'hover:bg-[#252528] hover:text-white',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1f] disabled:hover:text-[#6b6b6b]'
          )}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, i) =>
          page === '...' ? (
            <span
              key={`dots-${i}`}
              className="px-2 text-[#6b6b6b] select-none"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                buttonSize,
                'flex items-center justify-center rounded-lg font-medium transition-colors',
                currentPage === page
                  ? 'bg-[#16DE93] text-black'
                  : 'bg-[#1a1a1f] text-[#6b6b6b] hover:bg-[#252528] hover:text-white'
              )}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={cn(
            buttonSize,
            'flex items-center justify-center rounded-lg transition-colors',
            'bg-[#1a1a1f] text-[#6b6b6b]',
            'hover:bg-[#252528] hover:text-white',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1f] disabled:hover:text-[#6b6b6b]'
          )}
          aria-label="Next page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Legacy total items display */}
      {!showInfo && totalItems !== undefined && (
        <span className="text-[#6b6b6b] text-sm">
          {totalItems} {itemLabel}
        </span>
      )}
    </div>
  );
}

/** Rows per page selector component */
interface RowsPerPageProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

export function RowsPerPage({
  value,
  onChange,
  options = [20, 50, 100],
  className,
}: RowsPerPageProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        'bg-[#1a1a1f] text-sm text-white',
        'px-3 py-2 rounded-lg cursor-pointer appearance-none pr-8',
        'focus:outline-none focus:ring-1 focus:ring-[#16DE93]/30',
        'transition-colors',
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6b6b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        backgroundSize: '16px',
      }}
    >
      {options.map((n) => (
        <option key={n} value={n}>
          {n} rows
        </option>
      ))}
    </select>
  );
}

/** Complete pagination footer with info, pagination, and rows per page */
interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  rowOptions?: number[];
  className?: string;
}

export function PaginationFooter({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowOptions = [20, 50, 100],
  className,
}: PaginationFooterProps) {
  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page numbers (max 5 visible)
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // Show first 5 or centered around current
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  };

  return (
    <div className={cn(
      'flex items-center justify-center sm:justify-between gap-4',
      'px-4 py-3',
      className
    )}>
      {/* Left: Info text - hidden on mobile */}
      <span className="hidden sm:block text-[#56565B] text-sm">
        Showing {startItem}-{endItem} Out of {totalItems}
      </span>

      {/* Center: Pagination */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
            'bg-[#1a1a1f] border border-[#2a2a2f]',
            currentPage === 1
              ? 'text-[#3a3a3f] cursor-not-allowed'
              : 'text-[#6b6b6b] hover:text-white hover:bg-[#252528]'
          )}
          aria-label="Previous page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[24px] h-6 px-1 text-sm font-medium transition-colors',
                currentPage === page
                  ? 'text-[#16DE93]'
                  : 'text-[#6b6b6b] hover:text-white'
              )}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-md transition-colors',
            currentPage === totalPages
              ? 'bg-[#3a3a3f] text-[#6b6b6b] cursor-not-allowed'
              : 'bg-white text-black hover:bg-gray-200'
          )}
          aria-label="Next page"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right: Show rows dropdown - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-[#6b6b6b] text-sm">Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className={cn(
            'bg-transparent text-sm text-white',
            'px-1 py-1 cursor-pointer appearance-none pr-5',
            'focus:outline-none',
            'transition-colors'
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6b6b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0 center',
            backgroundSize: '14px',
          }}
        >
          {rowOptions.map((n) => (
            <option key={n} value={n} className="bg-[#1a1a1f]">
              {n}
            </option>
          ))}
        </select>
      </div>
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
