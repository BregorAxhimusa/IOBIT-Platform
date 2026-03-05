'use client';

import { cn } from '@/lib/utils/cn';

interface LeaderboardSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LeaderboardSearch({
  value,
  onChange,
  placeholder = 'Search by trader address or wallet',
  className,
}: LeaderboardSearchProps) {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-[#6b6b6b]"
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
        placeholder={placeholder}
        className="bg-[#56565B]/30 rounded-md pl-9 md:pl-11 pr-3 md:pr-4 py-2 md:py-2.5 text-xs md:text-sm text-white placeholder-[#6b6b6b] focus:outline-none focus:ring-1 focus:ring-[#16DE93]/30 w-full transition-all"
      />
    </div>
  );
}
