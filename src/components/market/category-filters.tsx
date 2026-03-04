'use client';

import { cn } from '@/lib/utils/cn';
import { ALL_CATEGORIES, type CoinCategory } from '@/lib/utils/coin-categories';

interface CategoryFiltersProps {
  activeCategory: CoinCategory;
  onCategoryChange: (category: CoinCategory) => void;
}

export function CategoryFilters({ activeCategory, onCategoryChange }: CategoryFiltersProps) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto pb-1 px-1 scrollbar-hide">
      {ALL_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'px-4 py-2 text-sm font-medium whitespace-nowrap rounded-md transition-all duration-200',
            activeCategory === cat
              ? 'bg-[#505057]/40 text-white'
              : 'text-[#6b6b6b] hover:text-white'
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
