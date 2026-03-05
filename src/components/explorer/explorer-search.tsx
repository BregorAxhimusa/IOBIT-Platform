'use client';

import { cn } from '@/lib/utils/cn';

interface ExplorerSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ExplorerSearch({ value, onChange, className }: ExplorerSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-[#56565B]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by block, transaction hash or user address"
        className={cn(
          'w-full bg-[#56565B]/30 rounded-md',
          'pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-2.5',
          'text-xs md:text-sm text-white placeholder:text-[#56565B]',
          'border border-[#303030]',
          'focus:outline-none focus:border-[#16DE93] focus:ring-1 focus:ring-[#16DE93]/20',
          'transition-colors'
        )}
      />
    </div>
  );
}
