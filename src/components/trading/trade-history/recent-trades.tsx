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
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs text-gray-500 font-normal border-b border-white/20 bg-[#111111]/30">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Time</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {displayedTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-gray-500 text-xs">No trades yet</span>
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
                  trade.side === 'buy' ? 'hover:bg-emerald-500/10' : 'hover:bg-rose-500/10'
                )}
              >
                <div
                  className={cn(
                    'text-left font-normal tabular-nums',
                    trade.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {parseFloat(trade.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300 tabular-nums">
                  {parseFloat(trade.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500 tabular-nums">{timeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
