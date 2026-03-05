'use client';

import { cn } from '@/lib/utils/cn';

export type PortfolioRoute = 'overview' | 'orders' | 'funds' | 'transfers';

interface PortfolioSidebarProps {
  activeRoute: PortfolioRoute;
  onRouteChange: (route: PortfolioRoute) => void;
}

const MENU_ITEMS: { key: PortfolioRoute; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'orders', label: 'Orders' },
  { key: 'funds', label: 'Funds' },
  { key: 'transfers', label: 'Transfers' },
];

export function PortfolioSidebar({ activeRoute, onRouteChange }: PortfolioSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[202px] min-h-full bg-[#0a0a0c] border-r border-[#1a1a1f] shrink-0">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => onRouteChange(item.key)}
            className={cn(
              'w-full text-left py-3 pl-5 text-sm border-b border-[#1a1a1f] transition-colors',
              activeRoute === item.key
                ? 'bg-[#16DE93] text-black font-medium'
                : 'text-white hover:bg-[#56565B]/20'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Mobile Tabs - Full width */}
      <div className="lg:hidden w-full bg-[#0a0a0c] border-b border-[#1a1a1f]">
        <div className="flex w-full">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => onRouteChange(item.key)}
              className={cn(
                'flex-1 py-2.5 text-sm whitespace-nowrap transition-colors relative text-center',
                activeRoute === item.key
                  ? 'text-white'
                  : 'text-[#56565B]'
              )}
            >
              {item.label}
              {activeRoute === item.key && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#16DE93]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
