'use client';

import { useOrdersStore } from '@/store/orders-store';
import { useCancelOrder } from '@/hooks/use-cancel-order';
import { useUserOrders } from '@/hooks/use-user-orders';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';

export function OpenOrdersTable() {
  const openOrders = useOrdersStore((state) => state.openOrders);
  const { cancelOrder, cancelAllOrders, isCanceling } = useCancelOrder();
  const { isLoading } = useUserOrders();

  const handleCancelOrder = async (orderId: string, symbol: string, oid: number) => {
    await cancelOrder(orderId, symbol, oid);
  };

  const handleCancelAll = async () => {
    if (openOrders.length > 0) {
      // Use the symbol from the first order
      await cancelAllOrders(openOrders[0].symbol);
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={3} columns={9} />;
  }

  if (openOrders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
        No open orders
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4 px-4">
        <h3 className="text-sm font-semibold text-white">Open Orders ({openOrders.length})</h3>
        <button
          onClick={handleCancelAll}
          disabled={isCanceling || openOrders.length === 0}
          className="px-3 py-1 text-xs bg-[#ef4444]/10 hover:bg-[#ef4444]/20 disabled:bg-gray-800 disabled:text-gray-500 text-[#ef4444] rounded transition-colors border border-[#ef4444]/20"
        >
          {isCanceling ? 'Canceling...' : 'Cancel All'}
        </button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Time</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Symbol</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Type</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Side</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Price</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Size</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Filled</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400">Status</th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {openOrders.map((order) => {
            const filledPercent = (parseFloat(order.filledSize) / parseFloat(order.size)) * 100;
            const date = new Date(order.timestamp);
            const timeStr = date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            });

            return (
              <tr
                key={order.id}
                className="border-b border-gray-800 hover:bg-[#1a2028]/50 transition-colors"
              >
                <td className="py-3 px-4 text-gray-400 text-xs">{timeStr}</td>
                <td className="py-3 px-4 font-medium text-white">{order.symbol}</td>
                <td className="py-3 px-4 text-gray-300 capitalize">{order.type}</td>
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
                <td className="py-3 px-4 text-right text-gray-300">{order.size}</td>
                <td className="py-3 px-4 text-right text-gray-300">
                  {order.filledSize} ({filledPercent.toFixed(1)}%)
                </td>
                <td className="py-3 px-4">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      order.status === 'open'
                        ? 'bg-[#3B82F6]/10 text-[#3B82F6]'
                        : order.status === 'partial'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : order.status === 'filled'
                        ? 'bg-[#14b8a6]/10 text-[#14b8a6]'
                        : 'bg-gray-500/10 text-gray-400'
                    )}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => handleCancelOrder(order.id, order.symbol, order.oid)}
                      disabled={isCanceling}
                      className="px-3 py-1 text-xs bg-[#1a2028] hover:bg-[#2a3038] disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors border border-gray-700"
                    >
                      {isCanceling ? 'Canceling...' : 'Cancel'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
