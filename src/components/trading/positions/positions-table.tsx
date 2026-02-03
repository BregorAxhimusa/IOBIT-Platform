'use client';

import { useEffect, useState } from 'react';
import { usePositionsStore } from '@/store/positions-store';
import { useClosePosition } from '@/hooks/use-close-position';
import { useUserPositions } from '@/hooks/use-user-positions';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';

export function PositionsTable() {
  const [mounted, setMounted] = useState(false);
  const positions = usePositionsStore((state) => state.positions);
  const getTotalUnrealizedPnl = usePositionsStore((state) => state.getTotalUnrealizedPnl);
  const { closePosition, isClosing } = useClosePosition();
  const { isLoading } = useUserPositions();

  const totalPnl = getTotalUnrealizedPnl();

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClosePosition = async (symbol: string, side: 'long' | 'short', size: string) => {
    await closePosition(symbol, side, size);
  };

  if (!mounted || isLoading) {
    return <TableSkeleton rows={3} columns={10} />;
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No open positions
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Symbol</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Side</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Size</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Entry Price</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Mark Price</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Liq. Price</th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400">Leverage</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Unrealized PnL</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Margin</th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const pnl = parseFloat(position.unrealizedPnl);
            const pnlPercent = parseFloat(position.unrealizedPnlPercent);

            return (
              <tr
                key={position.symbol}
                className="border-b border-gray-800 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-white">{position.symbol}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-semibold',
                      position.side === 'long'
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                        : 'bg-[#ef4444]/10 text-[#ef4444]'
                    )}
                  >
                    {position.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{position.size}</td>
                <td className="py-3 px-4 text-right text-gray-300">
                  ${parseFloat(position.entryPrice).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  ${parseFloat(position.markPrice).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {position.liquidationPrice
                    ? `$${parseFloat(position.liquidationPrice).toLocaleString()}`
                    : '-'}
                </td>
                <td className="py-3 px-4 text-center text-gray-300">{position.leverage}x</td>
                <td className="py-3 px-4 text-right">
                  <div className={cn('font-medium', pnl >= 0 ? 'text-[#14b8a6]' : 'text-[#ef4444]')}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </div>
                  <div className={cn('text-xs', pnl >= 0 ? 'text-[#14b8a6]/70' : 'text-[#ef4444]/70')}>
                    {pnlPercent >= 0 ? '+' : ''}
                    {pnlPercent.toFixed(2)}%
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  ${parseFloat(position.margin).toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleClosePosition(position.symbol, position.side, position.size)}
                      disabled={isClosing}
                      className="px-3 py-1 text-xs bg-[#1a2028] hover:bg-[#2a3038] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors border border-gray-700"
                    >
                      {isClosing ? 'Closing...' : 'Close'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-700">
            <td colSpan={7} className="py-3 px-4 text-xs font-medium text-gray-400">
              Total Unrealized PnL
            </td>
            <td className="py-3 px-4 text-right">
              <span className={cn('font-semibold', totalPnl >= 0 ? 'text-[#14b8a6]' : 'text-[#ef4444]')}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
