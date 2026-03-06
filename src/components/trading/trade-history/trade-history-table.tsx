'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useUserTradeHistory } from '@/hooks/use-user-trade-history';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

const ROWS_PER_PAGE = 20;

export function TradeHistoryTable() {
  const { trades, isLoading } = useUserTradeHistory();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(trades.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const pageTrades = trades.slice(startIdx, startIdx + ROWS_PER_PAGE);

  if (isLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Image
          src="/iobit/landingpage/nofound.svg"
          alt="No trades"
          width={48}
          height={48}
          className="mb-3 opacity-50"
        />
        <span className="text-[#8A8A8E] text-sm">No trade history found</span>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-3 mb-4">
        <h3 className="text-sm font-normal text-white">Trade History ({trades.length})</h3>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-2 px-2">
        {pageTrades.map((trade) => {
          const date = new Date(trade.timestamp);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const realizedPnl = trade.realizedPnl ? parseFloat(trade.realizedPnl) : null;
          const sideColor = trade.side === 'buy' ? 'text-[#16DE93]' : 'text-[#f6465d]';
          const sideBg = trade.side === 'buy' ? 'bg-[#16DE93]/10' : 'bg-[#f6465d]/10';

          return (
            <div key={trade.id} className="bg-[#111111] border border-[#1a1a1f] rounded-lg p-3">
              {/* Header: Symbol + Side + PnL */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{trade.symbol}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-normal', sideBg, sideColor)}>
                    {trade.side.toUpperCase()}
                  </span>
                </div>
                {realizedPnl !== null ? (
                  <span className={cn('text-sm font-medium', realizedPnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                    {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[#68686f] text-sm">-</span>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-[#68686f]">Price</span>
                  <div className="text-white">${parseFloat(trade.price).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <span className="text-[#68686f]">Size</span>
                  <div className="text-white">{trade.size}</div>
                </div>
                <div>
                  <span className="text-[#68686f]">Fee</span>
                  <div className="text-white">${parseFloat(trade.fee).toFixed(4)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[#68686f]">Time</span>
                  <div className="text-white">{dateStr} {timeStr}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a2a2f]">
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Time</th>
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Symbol</th>
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Side</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Price</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Size</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Fee</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Realized PnL</th>
            </tr>
          </thead>
          <tbody>
            {pageTrades.map((trade) => {
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
                  className="border-b border-[#2a2a2f] hover:bg-[#0a0a0a]/50 transition-colors"
                >
                  <td className="py-3 px-4 text-white text-xs">{dateStr}</td>
                  <td className="py-3 px-4 font-normal text-white">{trade.symbol}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-normal',
                        trade.side === 'buy'
                          ? 'bg-[#16DE93]/10 text-[#16DE93]'
                          : 'bg-[#f6465d]/10 text-[#f6465d]'
                      )}
                    >
                      {trade.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    ${parseFloat(trade.price).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white">{trade.size}</td>
                  <td className="py-3 px-4 text-right text-white">
                    ${parseFloat(trade.fee).toFixed(4)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {realizedPnl !== null ? (
                      <span
                        className={cn(
                          'font-normal',
                          realizedPnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]'
                        )}
                      >
                        {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[#68686f]">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={trades.length}
        itemLabel="trades"
      />
    </div>
  );
}
