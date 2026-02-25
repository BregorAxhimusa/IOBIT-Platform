'use client';

import { useState } from 'react';
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
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No order history
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="px-4 mb-4">
        <h3 className="text-sm font-semibold text-white">Order History ({orderHistory.length})</h3>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-xs font-normal text-gray-400">Time</th>
            <th className="text-left py-3 px-4 text-xs font-normal text-gray-400">Symbol</th>
            <th className="text-left py-3 px-4 text-xs font-normal text-gray-400">Type</th>
            <th className="text-left py-3 px-4 text-xs font-normal text-gray-400">Side</th>
            <th className="text-right py-3 px-4 text-xs font-normal text-gray-400">Price</th>
            <th className="text-right py-3 px-4 text-xs font-normal text-gray-400">Trigger</th>
            <th className="text-right py-3 px-4 text-xs font-normal text-gray-400">Size</th>
            <th className="text-right py-3 px-4 text-xs font-normal text-gray-400">Filled</th>
            <th className="text-left py-3 px-4 text-xs font-normal text-gray-400">Status</th>
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
                className="border-b border-gray-800 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-400 text-xs">{dateStr}</td>
                <td className="py-3 px-4 font-normal text-white">{order.symbol}</td>
                <td className="py-3 px-4 text-gray-300 capitalize">
                  {order.type === 'stop-market'
                    ? 'Stop Market'
                    : order.type === 'stop-limit'
                    ? 'Stop Limit'
                    : order.type}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-semibold',
                      order.side === 'buy'
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                        : 'bg-[#ef4444]/10 text-[#ef4444]'
                    )}
                  >
                    {order.side.toUpperCase()}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {order.type === 'market' ? 'Market' : `$${parseFloat(order.price).toLocaleString()}`}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {order.triggerPrice ? `$${parseFloat(order.triggerPrice).toLocaleString()}` : '-'}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{order.size}</td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {order.filledSize} ({filledPercent.toFixed(1)}%)
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-normal',
                      order.status === 'filled'
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                        : order.status === 'cancelled'
                        ? 'bg-[#ef4444]/10 text-[#ef4444]'
                        : 'bg-gray-500/10 text-gray-400'
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
