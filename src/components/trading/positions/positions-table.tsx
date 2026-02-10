'use client';

import { useEffect, useState } from 'react';
import { usePositionsStore } from '@/store/positions-store';
import { useClosePosition } from '@/hooks/use-close-position';
import { useUserPositions } from '@/hooks/use-user-positions';
import { useSetTPSL } from '@/hooks/use-set-tpsl';
import { cn } from '@/lib/utils/cn';
import { TableSkeleton } from '@/components/ui/skeleton';

export function PositionsTable() {
  const [mounted, setMounted] = useState(false);
  const [showTPSLModal, setShowTPSLModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    symbol: string;
    side: 'long' | 'short';
    size: string;
    markPrice: string;
  } | null>(null);

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

  const handleOpenTPSL = (symbol: string, side: 'long' | 'short', size: string, markPrice: string) => {
    setSelectedPosition({ symbol, side, size, markPrice });
    setShowTPSLModal(true);
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
                      onClick={() => handleOpenTPSL(position.symbol, position.side, position.size, position.markPrice)}
                      className="px-3 py-1 text-xs bg-[#1a2028] hover:bg-[#2a3038] text-white rounded transition-colors border border-gray-700"
                    >
                      TP/SL
                    </button>
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

      {/* TP/SL Modal */}
      {showTPSLModal && selectedPosition && (
        <TPSLModal
          position={selectedPosition}
          onClose={() => {
            setShowTPSLModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}

// TP/SL Modal Component
function TPSLModal({
  position,
  onClose,
}: {
  position: { symbol: string; side: 'long' | 'short'; size: string; markPrice: string };
  onClose: () => void;
}) {
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [enableTP, setEnableTP] = useState(false);
  const [enableSL, setEnableSL] = useState(false);
  const { mutate: setTPSL, isPending } = useSetTPSL();

  const handleSubmit = () => {
    if (!enableTP && !enableSL) {
      return;
    }

    setTPSL(
      {
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        takeProfitPrice: enableTP ? takeProfitPrice : undefined,
        stopLossPrice: enableSL ? stopLossPrice : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const markPriceNum = parseFloat(position.markPrice);
  const isLong = position.side === 'long';

  // Suggest TP/SL prices (5% profit, 2% loss)
  const suggestedTP = isLong ? markPriceNum * 1.05 : markPriceNum * 0.95;
  const suggestedSL = isLong ? markPriceNum * 0.98 : markPriceNum * 1.02;

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
            <h2 className="text-lg font-semibold text-white mb-1">Set TP/SL</h2>
            <p className="text-sm text-gray-400">
              {position.symbol} · {position.side.toUpperCase()} · {position.size}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mark Price: ${markPriceNum.toLocaleString()}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Take Profit */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={enableTP}
                  onChange={(e) => setEnableTP(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-[#0f1419] text-[#14b8a6] focus:ring-[#14b8a6] focus:ring-offset-0 cursor-pointer"
                />
                <label className="text-sm text-gray-300 font-medium">Take Profit</label>
                {enableTP && (
                  <button
                    onClick={() => setTakeProfitPrice(suggestedTP.toFixed(2))}
                    className="ml-auto text-xs text-[#14b8a6] hover:text-[#10b981]"
                  >
                    Suggest: ${suggestedTP.toFixed(2)}
                  </button>
                )}
              </div>
              {enableTP && (
                <input
                  type="number"
                  value={takeProfitPrice}
                  onChange={(e) => setTakeProfitPrice(e.target.value)}
                  placeholder={`Enter TP price (${isLong ? '>' : '<'} ${markPriceNum.toFixed(2)})`}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
                />
              )}
            </div>

            {/* Stop Loss */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={enableSL}
                  onChange={(e) => setEnableSL(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-[#0f1419] text-[#ef4444] focus:ring-[#ef4444] focus:ring-offset-0 cursor-pointer"
                />
                <label className="text-sm text-gray-300 font-medium">Stop Loss</label>
                {enableSL && (
                  <button
                    onClick={() => setStopLossPrice(suggestedSL.toFixed(2))}
                    className="ml-auto text-xs text-[#ef4444] hover:text-[#dc2626]"
                  >
                    Suggest: ${suggestedSL.toFixed(2)}
                  </button>
                )}
              </div>
              {enableSL && (
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(e.target.value)}
                  placeholder={`Enter SL price (${isLong ? '<' : '>'} ${markPriceNum.toFixed(2)})`}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#0f1419] border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-[#14b8a6]"
                />
              )}
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 bg-[#0f1419] p-3 rounded">
              <p>• TP/SL orders are placed as trigger orders</p>
              <p>• TP uses limit order, SL uses market order</p>
              <p>• Both are reduce-only (won&apos;t increase position)</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isPending || (!enableTP && !enableSL)}
              className="w-full py-3 bg-[#0f5549] hover:bg-[#0a3d34] disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded font-semibold transition-colors"
            >
              {isPending ? 'Setting...' : 'Set TP/SL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
