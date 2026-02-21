'use client';

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
    <div className="flex flex-col h-full">
      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 border-b border-gray-800">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-hidden">
        {displayedTrades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No trades yet
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
                className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-0.5 sm:py-1.5 text-[10px] sm:text-xs hover:bg-gray-800/30 transition-colors"
              >
                <div
                  className={cn(
                    'text-left font-medium',
                    trade.side === 'buy' ? 'text-green-400' : 'text-red-400'
                  )}
                >
                  {parseFloat(trade.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300">
                  {parseFloat(trade.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500">{timeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
