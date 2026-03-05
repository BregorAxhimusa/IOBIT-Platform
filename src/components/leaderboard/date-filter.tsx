'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

export type DateFilterValue = '7d' | '30d' | '90d' | 'all';

interface DateFilterOption {
  value: DateFilterValue;
  label: string;
}

const DATE_OPTIONS: DateFilterOption[] = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: 'all', label: 'All Time' },
];

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = DATE_OPTIONS.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 md:gap-2 px-1 md:px-4 py-2.5 md:py-3',
          'bg-transparent',
          'text-white text-[10px] md:text-sm',
          'transition-colors',
          'justify-between'
        )}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <svg
            className="w-3 h-3 md:w-4 md:h-4 text-[#56565B] hidden sm:block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="whitespace-nowrap">{selectedOption?.label}</span>
        </div>
        <svg
          className={cn(
            'w-3 h-3 md:w-4 md:h-4 text-[#56565B] transition-transform ml-0.5 md:ml-1',
            isOpen && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 md:left-0 md:right-auto mt-1 min-w-[100px] md:w-full bg-[#0a0a0c] border border-[#1a1a1f] rounded-lg overflow-hidden z-50 shadow-lg">
          {DATE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-3 md:px-4 py-2 md:py-2.5 text-left text-xs md:text-sm transition-colors whitespace-nowrap',
                option.value === value
                  ? 'bg-[#16DE93]/10 text-[#16DE93]'
                  : 'text-white hover:bg-[#1a1a1f]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
