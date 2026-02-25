'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

interface ScaleOrder {
  price: number;
  size: number;
  index: number;
}

interface ScalePreviewProps {
  startPrice: number;
  endPrice: number;
  totalSize: number;
  numOrders: number;
  sizeSkew: number;
  side: 'buy' | 'sell';
}

function calculateScaleDistribution(params: {
  numOrders: number;
  totalSize: number;
  startPrice: number;
  endPrice: number;
  sizeSkew: number;
}): ScaleOrder[] {
  const { numOrders, totalSize, startPrice, endPrice, sizeSkew } = params;

  if (numOrders < 2 || totalSize <= 0 || startPrice <= 0 || endPrice <= 0) {
    return [];
  }

  const orders: ScaleOrder[] = [];

  for (let i = 0; i < numOrders; i++) {
    const ratio = numOrders === 1 ? 0 : i / (numOrders - 1);
    const price = startPrice + (endPrice - startPrice) * ratio;

    // Skew-based sizing: skew=1 means equal, >1 means more at start, <1 means more at end
    const weight = Math.pow(sizeSkew, numOrders - 1 - i);
    orders.push({ price, size: weight, index: i });
  }

  // Normalize sizes to match totalSize
  const totalWeight = orders.reduce((sum, o) => sum + o.size, 0);
  orders.forEach(order => {
    order.size = (order.size / totalWeight) * totalSize;
  });

  return orders;
}

export function ScalePreview({ startPrice, endPrice, totalSize, numOrders, sizeSkew, side }: ScalePreviewProps) {
  const orders = useMemo(() => {
    if (!startPrice || !endPrice || !totalSize || !numOrders) return [];
    return calculateScaleDistribution({
      numOrders,
      totalSize,
      startPrice,
      endPrice,
      sizeSkew,
    });
  }, [startPrice, endPrice, totalSize, numOrders, sizeSkew]);

  if (orders.length === 0) return null;

  const maxSize = Math.max(...orders.map(o => o.size));
  const isBuy = side === 'buy';
  const totalValue = orders.reduce((sum, o) => sum + o.price * o.size, 0);

  return (
    <div className="mt-3 p-3 rounded-lg bg-[#0f0f1a] border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-normal">
          Order Distribution
        </span>
        <span className="text-xs text-gray-500">
          {orders.length} orders
        </span>
      </div>

      {/* Visual bars */}
      <div className="space-y-1">
        {orders.map((order) => (
          <div key={order.index} className="flex items-center gap-2 text-xs">
            <span className="w-[72px] text-right text-gray-400 shrink-0">
              ${order.price.toFixed(2)}
            </span>

            <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
              <div
                className={cn(
                  'h-full rounded transition-all',
                  isBuy ? 'bg-teal-500/40' : 'bg-red-500/40'
                )}
                style={{ width: `${(order.size / maxSize) * 100}%` }}
              />
            </div>

            <span className="w-16 text-right text-gray-400 shrink-0">
              {order.size.toFixed(4)}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-2 pt-2 border-t border-gray-800 flex justify-between text-xs">
        <span className="text-gray-500">
          ${orders[0]?.price.toFixed(2)} — ${orders[orders.length - 1]?.price.toFixed(2)}
        </span>
        <span className="text-gray-400">
          ~${totalValue.toFixed(2)} total
        </span>
      </div>
    </div>
  );
}
