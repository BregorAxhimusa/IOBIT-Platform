'use client';

import Image from 'next/image';
import { useRecentTrades } from '@/hooks/use-recent-trades';
import { cn } from '@/lib/utils/cn';

interface RecentTradesProps {
  symbol: string;
}

export function RecentTrades({ symbol }: RecentTradesProps) {
  const { trades } = useRecentTrades(symbol);

  // Limit to 30 recent trades to match order book height
  const displayedTrades = trades.slice(0, 30);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs text-[#68686f] font-normal border-b border-[#1a1a1f] bg-[#0a0a0a]">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {displayedTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Image
              src="/iobit/landingpage/nofound.svg"
              alt="No trades"
              width={40}
              height={40}
              className="opacity-50"
            />
            <span className="text-[#8A8A8E] text-xs">No trades yet</span>
          </div>
        ) : (
          displayedTrades.map((trade, idx) => {
            const date = new Date(trade.time);
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });

            return (
              <div
                key={`${trade.time}-${idx}`}
                className={cn(
                  "grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs transition-colors",
                  trade.side === 'buy' ? 'hover:bg-[#16DE93]/10' : 'hover:bg-[#f6465d]/10'
                )}
              >
                <div
                  className={cn(
                    'text-left font-normal tabular-nums',
                    trade.side === 'buy' ? 'text-[#16DE93]' : 'text-[#f6465d]'
                  )}
                >
                  {parseFloat(trade.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-white tabular-nums">
                  {parseFloat(trade.size).toFixed(4)}
                </div>
                <div className="text-right text-[#68686f] tabular-nums">{timeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
