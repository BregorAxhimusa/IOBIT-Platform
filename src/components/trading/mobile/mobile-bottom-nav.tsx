'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

type MobileSection = 'trade' | 'markets' | 'account';

interface MobileBottomNavProps {
  activeSection?: MobileSection;
  onSectionChange?: (section: MobileSection) => void;
}

export function MobileBottomNav({ activeSection = 'trade', onSectionChange }: MobileBottomNavProps) {
  const pathname = usePathname();
  const isOnTradePage = pathname?.startsWith('/trade');

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Blur overlay above the nav */}
      <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-t from-[#0a0a0c]/90 to-transparent backdrop-blur-[2px] pointer-events-none" />
      <div className="bg-[#0a0a0c]">
      <div className="flex items-center justify-around h-14">
        {/* Markets - Shows Positions/Orders table */}
        <button
          onClick={() => onSectionChange?.('markets')}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
            isOnTradePage && activeSection === 'markets' ? 'text-white' : 'text-[#56565B]'
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
          </svg>
          <span className="text-[10px] font-medium">Markets</span>
        </button>

        {/* Trade - Shows Buy/Sell buttons */}
        <button
          onClick={() => onSectionChange?.('trade')}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
            isOnTradePage && activeSection === 'trade' ? 'text-white' : 'text-[#56565B]'
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
            />
          </svg>
          <span className="text-[10px] font-medium">Trade</span>
        </button>

        {/* Account */}
        <button
          onClick={() => onSectionChange?.('account')}
          className={cn(
            'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
            isOnTradePage && activeSection === 'account' ? 'text-white' : 'text-[#56565B]'
          )}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-[10px] font-medium">Account</span>
        </button>
      </div>
      </div>
    </div>
  );
}
