'use client';

import { useUserTradeHistory } from '@/hooks/use-user-trade-history';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';

export function TradeHistoryTable() {
  const { trades, isLoading } = useUserTradeHistory();

  if (isLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (trades.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No trade history found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="px-4 mb-4">
        <h3 className="text-sm font-semibold text-white">Trade History ({trades.length})</h3>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Time</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Symbol</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Side</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Price</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Size</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Fee</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Realized PnL</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const date = new Date(trade.timestamp);
            const dateStr = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const realizedPnl = trade.realizedPnl ? parseFloat(trade.realizedPnl) : null;

            return (
              <tr
                key={trade.id}
                className="border-b border-gray-800 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-400 text-xs">{dateStr}</td>
                <td className="py-3 px-4 font-medium text-white">{trade.symbol}</td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-semibold',
                      trade.side === 'buy'
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                        : 'bg-[#ef4444]/10 text-[#ef4444]'
                    )}
                  >
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  ${parseFloat(trade.price).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{trade.size}</td>
                <td className="py-3 px-4 text-right text-gray-300">
                  ${parseFloat(trade.fee).toFixed(4)}
                </td>
                <td className="py-3 px-4 text-right">
                  {realizedPnl !== null ? (
                    <span
                      className={cn(
                        'font-medium',
                        realizedPnl >= 0 ? 'text-[#14b8a6]' : 'text-[#ef4444]'
                      )}
                    >
                      {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
