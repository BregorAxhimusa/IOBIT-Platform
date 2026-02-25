'use client';

import { useState } from 'react';
import { useOrdersStore } from '@/store/orders-store';
import { useCancelOrder } from '@/hooks/use-cancel-order';
import { useModifyOrder } from '@/hooks/use-modify-order';
import { useUserOrders } from '@/hooks/use-user-orders';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';

export function OpenOrdersTable() {
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    oid: number;
    symbol: string;
    side: 'buy' | 'sell';
    price: string;
    size: string;
    type: string;
  } | null>(null);

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

  const handleOpenModify = (order: { oid: number; symbol: string; side: 'buy' | 'sell'; price: string; size: string; type: string }) => {
    setSelectedOrder({
      oid: order.oid,
      symbol: order.symbol,
      side: order.side,
      price: order.price,
      size: order.size,
      type: order.type,
    });
    setShowModifyModal(true);
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
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400">Trigger</th>
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
                  <div className="flex items-center justify-center gap-2">
                    {order.type === 'limit' && (
                      <button
                        onClick={() => handleOpenModify(order)}
                        className="px-3 py-1 text-xs bg-[#1a2028] hover:bg-[#2a3038] text-white rounded transition-colors border border-gray-700"
                      >
                        Modify
                      </button>
                    )}
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

      {/* Modify Order Modal */}
      {showModifyModal && selectedOrder && (
        <ModifyOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowModifyModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

// Modify Order Modal Component
function ModifyOrderModal({
  order,
  onClose,
}: {
  order: {
    oid: number;
    symbol: string;
    side: 'buy' | 'sell';
    price: string;
    size: string;
    type: string;
  };
  onClose: () => void;
}) {
  const [newPrice, setNewPrice] = useState(order.price);
  const [newSize, setNewSize] = useState(order.size);
  const { mutate: modifyOrder, isPending } = useModifyOrder();

  const handleSubmit = () => {
    modifyOrder(
      {
        oid: order.oid,
        symbol: order.symbol,
        side: order.side,
        price: newPrice,
        size: newSize,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a2028] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-1">Modify Order</h2>
            <p className="text-sm text-gray-400">
              {order.symbol} · {order.side.toUpperCase()} · {order.type.toUpperCase()}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Price */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Price (USDC)
              </label>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: ${parseFloat(order.price).toLocaleString()}
              </p>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Size ({order.symbol})
              </label>
              <input
                type="number"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="0.00"
                step="0.0001"
                className="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {order.size}
              </p>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 bg-[#111111] p-3 rounded">
              <p>• Modifying an order requires a new signature</p>
              <p>• Order ID and timestamp will be updated</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isPending || !newPrice || !newSize}
              className="w-full py-2.5 bg-[#0f5549] hover:bg-[#0a3d34] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {isPending ? 'Modifying...' : 'Modify Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
