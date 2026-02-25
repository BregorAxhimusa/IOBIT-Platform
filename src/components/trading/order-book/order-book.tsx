'use client';

import { useOrderBook } from '@/hooks/use-orderbook';
import { useOrderBookStore } from '@/store/orderbook-store';

interface OrderBookProps {
  symbol: string;
  onPriceClick?: (price: string) => void;
}

export function OrderBook({ symbol, onPriceClick }: OrderBookProps) {
  const { orderBook, isLoading } = useOrderBook(symbol);
  const getSpread = useOrderBookStore((state) => state.getSpread);

  const spread = getSpread(symbol);
  const spreadPercentage = spread && orderBook?.asks[0]
    ? (spread / parseFloat(orderBook.asks[0].price)) * 100
    : 0;

  // Show top 15 levels for each side
  const displayedAsks = orderBook?.asks.slice(0, 15).reverse() || [];
  const displayedBids = orderBook?.bids.slice(0, 15) || [];

  // Calculate max size for depth visualization
  const maxAskSize = Math.max(...displayedAsks.map((a) => parseFloat(a.size)), 1);
  const maxBidSize = Math.max(...displayedBids.map((b) => parseFloat(b.size)), 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0f0f0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
          <span className="text-gray-500 text-xs">Loading order book...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f]">
      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs text-gray-500 font-normal border-b border-white/20 bg-[#111111]/30">
        <div className="text-left">Price</div>
        <div className="text-right">Size</div>
        <div className="text-right">Total</div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (Sells) - Red */}
        <div className="flex-1 overflow-hidden flex flex-col-reverse">
          {displayedAsks.map((ask, idx) => {
            const depthPercent = (parseFloat(ask.size) / maxAskSize) * 100;
            let cumulative = 0;
            for (let i = displayedAsks.length - 1; i >= idx; i--) {
              cumulative += parseFloat(displayedAsks[i].size);
            }

            return (
              <button
                key={idx}
                onClick={() => onPriceClick?.(ask.price)}
                className="relative grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs hover:bg-rose-500/10 transition-colors cursor-pointer group"
              >
                {/* Depth bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-rose-500/15 to-transparent transition-all"
                  style={{ width: `${depthPercent}%` }}
                />

                <div className="text-left text-rose-400 relative z-10 font-normal group-hover:text-rose-300 transition-colors">
                  {parseFloat(ask.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300 relative z-10 tabular-nums">
                  {parseFloat(ask.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500 relative z-10 tabular-nums">
                  {cumulative.toFixed(4)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Spread */}
        <div className="px-3 sm:px-4 py-2 bg-[#111111]/50 border-y border-white/20">
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-gray-500 font-normal">Spread</span>
            <span className="text-white font-semibold tabular-nums">
              {spread ? (
                <span className="flex items-center gap-2">
                  <span>{spread.toFixed(2)}</span>
                  <span className="text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded text-[9px]">
                    {spreadPercentage.toFixed(3)}%
                  </span>
                </span>
              ) : (
                '-'
              )}
            </span>
          </div>
        </div>

        {/* Bids (Buys) - Green */}
        <div className="flex-1 overflow-hidden flex flex-col justify-start">
          {displayedBids.map((bid, idx) => {
            const depthPercent = (parseFloat(bid.size) / maxBidSize) * 100;
            let cumulative = 0;
            for (let i = 0; i <= idx; i++) {
              cumulative += parseFloat(displayedBids[i].size);
            }

            return (
              <button
                key={idx}
                onClick={() => onPriceClick?.(bid.price)}
                className="relative grid grid-cols-3 gap-1 sm:gap-2 px-3 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs hover:bg-emerald-500/10 transition-colors cursor-pointer group"
              >
                {/* Depth bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-emerald-500/15 to-transparent transition-all"
                  style={{ width: `${depthPercent}%` }}
                />

                <div className="text-left text-emerald-400 relative z-10 font-normal group-hover:text-emerald-300 transition-colors">
                  {parseFloat(bid.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300 relative z-10 tabular-nums">
                  {parseFloat(bid.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500 relative z-10 tabular-nums">
                  {cumulative.toFixed(4)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
