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
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading order book...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 border-b border-gray-800">
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
                className="relative grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                {/* Depth bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                  style={{ width: `${depthPercent}%` }}
                />

                <div className="text-left text-red-400 relative z-10">
                  {parseFloat(ask.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300 relative z-10">
                  {parseFloat(ask.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500 relative z-10">
                  {cumulative.toFixed(4)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Spread */}
        <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-900 border-y border-gray-800">
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-gray-400">Spread</span>
            <span className="text-gray-300">
              {spread ? (
                <>
                  {spread.toFixed(2)} ({spreadPercentage.toFixed(3)}%)
                </>
              ) : (
                '-'
              )}
            </span>
          </div>
        </div>

        {/* Bids (Buys) - Green */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end">
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
                className="relative grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-0.5 sm:py-1 text-[10px] sm:text-xs hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                {/* Depth bar */}
                <div
                  className="absolute right-0 top-0 bottom-0 bg-green-500/10"
                  style={{ width: `${depthPercent}%` }}
                />

                <div className="text-left text-green-400 relative z-10">
                  {parseFloat(bid.price).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div className="text-right text-gray-300 relative z-10">
                  {parseFloat(bid.size).toFixed(4)}
                </div>
                <div className="text-right text-gray-500 relative z-10">
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
