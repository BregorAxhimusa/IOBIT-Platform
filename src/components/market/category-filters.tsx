'use client';

import { cn } from '@/lib/utils/cn';
import { ALL_CATEGORIES, type CoinCategory } from '@/lib/utils/coin-categories';

interface CategoryFiltersProps {
  activeCategory: CoinCategory;
  onCategoryChange: (category: CoinCategory) => void;
}

export function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'px-3 py-1.5 text-xs whitespace-nowrap border transition-colors',
            activeCategory === cat
              ? 'bg-teal-500/20 border-teal-500/50 text-teal-400'
              : 'bg-transparent border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
