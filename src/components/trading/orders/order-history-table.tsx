'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useOrdersStore } from '@/store/orders-store';
import { useOrderHistory } from '@/hooks/use-order-history';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

const ROWS_PER_PAGE = 20;

export function OrderHistoryTable() {
  const orderHistory = useOrdersStore((state) => state.orderHistory);
  const { isLoading } = useOrderHistory();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orderHistory.length / ROWS_PER_PAGE);
  const startIdx = (currentPage - 1) * ROWS_PER_PAGE;
  const pageOrders = orderHistory.slice(startIdx, startIdx + ROWS_PER_PAGE);

  if (isLoading) {
    return <TableSkeleton rows={5} columns={8} />;
  }

  if (orderHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Image
          src="/iobit/landingpage/nofound.svg"
          alt="No orders"
          width={48}
          height={48}
          className="mb-3 opacity-50"
        />
        <span className="text-[#8A8A8E] text-sm">No order history</span>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 pt-3 mb-4">
        <h3 className="text-sm font-normal text-white">Order History ({orderHistory.length})</h3>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-2 px-2">
        {pageOrders.map((order) => {
          const filledPercent = (parseFloat(order.filledSize) / parseFloat(order.size)) * 100;
          const date = new Date(order.timestamp);
          const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
          const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const sideColor = order.side === 'buy' ? 'text-[#16DE93]' : 'text-[#f6465d]';
          const sideBg = order.side === 'buy' ? 'bg-[#16DE93]/10' : 'bg-[#f6465d]/10';

          return (
            <div key={order.id} className="bg-[#111111] border border-[#1a1a1f] rounded-lg p-3">
              {/* Header: Symbol + Side + Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{order.symbol}</span>
                  <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-normal', sideBg, sideColor)}>
                    {order.side.toUpperCase()}
                  </span>
                </div>
                <span className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-normal',
                  order.status === 'filled' ? 'bg-[#16DE93]/10 text-[#16DE93]' :
                  order.status === 'cancelled' ? 'bg-[#f6465d]/10 text-[#f6465d]' :
                  'bg-gray-500/10 text-white'
                )}>
                  {order.status}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div>
                  <span className="text-[#68686f]">Price</span>
                  <div className="text-white">
                    {order.type === 'market' ? 'Market' : `$${parseFloat(order.price).toLocaleString()}`}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[#68686f]">Size</span>
                  <div className="text-white">{order.size}</div>
                </div>
                <div>
                  <span className="text-[#68686f]">Filled</span>
                  <div className="text-white">{filledPercent.toFixed(1)}%</div>
                </div>
                <div className="text-right">
                  <span className="text-[#68686f]">Type</span>
                  <div className="text-white capitalize">{order.type}</div>
                </div>
              </div>

              {/* Time */}
              <div className="text-[10px] text-[#68686f]">{dateStr} {timeStr}</div>
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
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Type</th>
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Side</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Price</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Trigger</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Size</th>
              <th className="text-right py-3 px-4 text-xs font-normal text-white">Filled</th>
              <th className="text-left py-3 px-4 text-xs font-normal text-white">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageOrders.map((order) => {
              const filledPercent = (parseFloat(order.filledSize) / parseFloat(order.size)) * 100;
              const date = new Date(order.timestamp);
              const dateStr = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr
                  key={order.id}
                  className="border-b border-[#2a2a2f] hover:bg-[#0a0a0a]/50 transition-colors"
                >
                  <td className="py-3 px-4 text-white text-xs">{dateStr}</td>
                  <td className="py-3 px-4 font-normal text-white">{order.symbol}</td>
                  <td className="py-3 px-4 text-white capitalize">
                    {order.type === 'stop-market'
                      ? 'Stop Market'
                      : order.type === 'stop-limit'
                      ? 'Stop Limit'
                      : order.type}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-normal',
                        order.side === 'buy'
                          ? 'bg-[#16DE93]/10 text-[#16DE93]'
                          : 'bg-[#f6465d]/10 text-[#f6465d]'
                      )}
                    >
                      {order.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {order.type === 'market' ? 'Market' : `$${parseFloat(order.price).toLocaleString()}`}
                  </td>
                  <td className="py-3 px-4 text-right text-white">
                    {order.triggerPrice ? `$${parseFloat(order.triggerPrice).toLocaleString()}` : '-'}
                  </td>
                  <td className="py-3 px-4 text-right text-white">{order.size}</td>
                  <td className="py-3 px-4 text-right text-white">
                    {order.filledSize} ({filledPercent.toFixed(1)}%)
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-normal',
                        order.status === 'filled'
                          ? 'bg-[#16DE93]/10 text-[#16DE93]'
                          : order.status === 'cancelled'
                          ? 'bg-[#f6465d]/10 text-[#f6465d]'
                          : 'bg-gray-500/10 text-white'
                      )}
                    >
                      {order.status}
                    </span>
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
        totalItems={orderHistory.length}
        itemLabel="orders"
      />
    </div>
  );
}
