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
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    symbol: string;
    side: 'long' | 'short';
    size: string;
    markPrice: string;
    entryPrice: string;
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

  const handleOpenTPSL = (symbol: string, side: 'long' | 'short', size: string, markPrice: string, entryPrice: string) => {
    setSelectedPosition({ symbol, side, size, markPrice, entryPrice });
    setShowTPSLModal(true);
  };

  const handleOpenClose = (symbol: string, side: 'long' | 'short', size: string, markPrice: string, entryPrice: string) => {
    setSelectedPosition({ symbol, side, size, markPrice, entryPrice });
    setShowCloseModal(true);
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
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">Coin</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">Size</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400 hidden sm:table-cell">Position Value</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">Entry Price</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">Mark Price</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">PNL (ROE%)</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400 hidden sm:table-cell">Liq. Price</th>
            <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400 hidden md:table-cell">Margin</th>
            <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">Close</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const pnl = parseFloat(position.unrealizedPnl);
            const pnlPercent = parseFloat(position.unrealizedPnlPercent);
            const sizeNum = parseFloat(position.size);
            const markPriceNum = parseFloat(position.markPrice);
            const positionValue = sizeNum * markPriceNum;
            const sideColor = position.side === 'long' ? 'text-[#16DE93]' : 'text-[#f6465d]';

            return (
              <tr
                key={position.symbol}
                className="border-b border-gray-800 hover:bg-[#0a0a0a]/50 transition-colors"
              >
                {/* Coin: symbol + leverage badge (like Hyperliquid "BTC 5x") */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className={cn('font-normal', sideColor)}>{position.symbol}</span>
                    <span className={cn(
                      'px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-normal',
                      position.side === 'long'
                        ? 'bg-[#16DE93]/10 text-[#16DE93]'
                        : 'bg-[#f6465d]/10 text-[#f6465d]'
                    )}>
                      {position.leverage}x
                    </span>
                  </div>
                </td>
                {/* Size: amount + coin (like "0.00038 BTC") */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                  <span className={sideColor}>{position.size}</span>
                  <span className="text-gray-500 text-[10px] ml-1">{position.symbol}</span>
                </td>
                {/* Position Value */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-300 hidden sm:table-cell">
                  {positionValue.toFixed(2)} <span className="text-gray-500 text-[10px]">USDC</span>
                </td>
                {/* Entry Price */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-300">
                  {parseFloat(position.entryPrice).toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </td>
                {/* Mark Price */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-300">
                  {markPriceNum.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                </td>
                {/* PNL (ROE%) */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                  <div className={cn('font-normal', pnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                    {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                  </div>
                  <div className={cn('text-[9px] sm:text-xs', pnl >= 0 ? 'text-[#16DE93]/70' : 'text-[#f6465d]/70')}>
                    ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                  </div>
                </td>
                {/* Liq. Price */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-300 hidden sm:table-cell">
                  {position.liquidationPrice
                    ? parseFloat(position.liquidationPrice).toLocaleString(undefined, { minimumFractionDigits: 1 })
                    : '-'}
                </td>
                {/* Margin */}
                <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-300 hidden md:table-cell">
                  ${parseFloat(position.margin).toFixed(2)}
                </td>
                {/* Close / TP/SL */}
                <td className="py-2 sm:py-3 px-1 sm:px-4">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleOpenTPSL(position.symbol, position.side, position.size, position.markPrice, position.entryPrice)}
                      className="px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-[#0a0a0a] hover:bg-[#2a3038] text-white rounded transition-colors border border-gray-700"
                    >
                      TP/SL
                    </button>
                    <button
                      onClick={() => handleOpenClose(position.symbol, position.side, position.size, position.markPrice, position.entryPrice)}
                      disabled={isClosing}
                      className="px-1.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-[#0a0a0a] hover:bg-[#2a3038] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded transition-colors border border-gray-700"
                    >
                      {isClosing ? '...' : 'Close'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-700">
            <td colSpan={5} className="py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-normal text-gray-400">
              Total PnL
            </td>
            <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
              <span className={cn('font-normal', totalPnl >= 0 ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
              </span>
            </td>
            <td className="hidden sm:table-cell"></td>
            <td className="hidden md:table-cell"></td>
            <td></td>
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

      {/* Close Confirmation Modal */}
      {showCloseModal && selectedPosition && (
        <CloseModal
          position={selectedPosition}
          isClosing={isClosing}
          onConfirm={async (symbol, side, size) => {
            await closePosition(symbol, side, size);
            setShowCloseModal(false);
            setSelectedPosition(null);
          }}
          onClose={() => {
            setShowCloseModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}

// Close Confirmation Modal (Hyperliquid-style)
function CloseModal({
  position,
  isClosing,
  onConfirm,
  onClose,
}: {
  position: { symbol: string; side: 'long' | 'short'; size: string; markPrice: string; entryPrice: string };
  isClosing: boolean;
  onConfirm: (symbol: string, side: 'long' | 'short', size: string) => Promise<void>;
  onClose: () => void;
}) {
  const [closeType, setCloseType] = useState<'market' | 'limit'>('market');

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-base font-normal text-white text-center mb-2">Confirm Close</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            This will close your {position.symbol} position and cancel associated TP/SL orders.
          </p>

          {/* Close Type Options */}
          <div className="space-y-3 mb-6">
            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCloseType('market')}
            >
              <div className={cn(
                'w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all',
                closeType === 'market'
                  ? 'bg-[#16DE93] border-[#16DE93]'
                  : 'border-gray-600 group-hover:border-gray-500'
              )}>
                {closeType === 'market' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white">Market Close</span>
            </label>

            <label
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setCloseType('limit')}
            >
              <div className={cn(
                'w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all',
                closeType === 'limit'
                  ? 'bg-[#16DE93] border-[#16DE93]'
                  : 'border-gray-600 group-hover:border-gray-500'
              )}>
                {closeType === 'limit' && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-white">Limit Close at Mid Price</span>
            </label>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => onConfirm(position.symbol, position.side, position.size)}
            disabled={isClosing}
            className="w-full py-3 bg-gradient-to-r from-[#16DE93] to-[#16DE93] hover:from-[#16DE93] hover:to-[#16DE93] disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-normal rounded-lg transition-all text-sm"
          >
            {isClosing ? 'Closing...' : `Confirm ${closeType === 'market' ? 'Market' : 'Limit'} Close`}
          </button>
        </div>
      </div>
    </div>
  );
}

// TP/SL Modal Component (Hyperliquid-style)
type TPSLMode = 'price' | 'percent';

function TPSLModal({
  position,
  onClose,
}: {
  position: { symbol: string; side: 'long' | 'short'; size: string; markPrice: string; entryPrice: string };
  onClose: () => void;
}) {
  const [tpPrice, setTpPrice] = useState('');
  const [slPrice, setSlPrice] = useState('');
  const [tpGain, setTpGain] = useState('');
  const [slLoss, setSlLoss] = useState('');
  const [tpMode, setTpMode] = useState<TPSLMode>('price');
  const [slMode, setSlMode] = useState<TPSLMode>('price');
  const { mutate: setTPSL, isPending } = useSetTPSL();

  const entryPriceNum = parseFloat(position.entryPrice) || 0;
  const markPriceNum = parseFloat(position.markPrice) || 0;
  const isLong = position.side === 'long';

  // Use entry price for % calculations, fallback to mark price
  const refPrice = entryPriceNum > 0 ? entryPriceNum : markPriceNum;

  // Convert % to price and vice versa
  const percentToPrice = (percent: number, isTP: boolean) => {
    if (isLong) {
      return isTP ? refPrice * (1 + percent / 100) : refPrice * (1 - percent / 100);
    }
    return isTP ? refPrice * (1 - percent / 100) : refPrice * (1 + percent / 100);
  };

  const priceToPercent = (price: number, isTP: boolean) => {
    if (refPrice === 0) return 0;
    if (isLong) {
      return isTP ? ((price - refPrice) / refPrice) * 100 : ((refPrice - price) / refPrice) * 100;
    }
    return isTP ? ((refPrice - price) / refPrice) * 100 : ((price - refPrice) / refPrice) * 100;
  };

  // Get the actual TP price (from either mode)
  const getTPPrice = (): string => {
    if (tpMode === 'price') return tpPrice;
    const pct = parseFloat(tpGain);
    if (isNaN(pct) || pct <= 0) return '';
    return percentToPrice(pct, true).toFixed(2);
  };

  // Get the actual SL price (from either mode)
  const getSLPrice = (): string => {
    if (slMode === 'price') return slPrice;
    const pct = parseFloat(slLoss);
    if (isNaN(pct) || pct <= 0) return '';
    return percentToPrice(pct, false).toFixed(2);
  };

  const handleSubmit = () => {
    const finalTP = getTPPrice();
    const finalSL = getSLPrice();

    if (!finalTP && !finalSL) {
      return;
    }

    setTPSL(
      {
        symbol: position.symbol,
        side: position.side,
        size: position.size,
        takeProfitPrice: finalTP || undefined,
        stopLossPrice: finalSL || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const hasTP = tpMode === 'price' ? !!tpPrice : !!tpGain;
  const hasSL = slMode === 'price' ? !!slPrice : !!slLoss;

  const formatPrice = (num: number) => {
    if (isNaN(num) || num === 0) return '-';
    return num.toLocaleString(undefined, { minimumFractionDigits: 1 });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-gray-700 rounded-lg max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg z-10"
        >
          ✕
        </button>

        <div className="p-6">
          {/* Title */}
          <h2 className="text-base font-normal text-white text-center mb-5">TP/SL for Position</h2>

          {/* Position Info */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Coin</span>
              <span className="text-sm text-white font-normal">{position.symbol}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Position</span>
              <span className={cn('text-sm font-normal', isLong ? 'text-[#16DE93]' : 'text-[#f6465d]')}>
                {position.size} {position.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Entry Price</span>
              <span className="text-sm text-white">{formatPrice(entryPriceNum)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Mark Price</span>
              <span className="text-sm text-white">{formatPrice(markPriceNum)}</span>
            </div>
          </div>

          {/* TP/SL Form */}
          <div className="space-y-3 mb-5">
            {/* Take Profit Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tpMode === 'price' ? tpPrice : tpGain}
                  onChange={(e) => {
                    if (tpMode === 'price') {
                      setTpPrice(e.target.value);
                    } else {
                      setTpGain(e.target.value);
                    }
                  }}
                  placeholder={tpMode === 'price' ? 'TP Price' : 'Gain %'}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#16DE93] transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (tpMode === 'price') {
                    if (tpPrice) {
                      const pct = priceToPercent(parseFloat(tpPrice), true);
                      setTpGain(pct > 0 ? pct.toFixed(2) : '');
                    }
                    setTpMode('percent');
                  } else {
                    if (tpGain) {
                      const price = percentToPrice(parseFloat(tpGain), true);
                      setTpPrice(price > 0 ? price.toFixed(2) : '');
                    }
                    setTpMode('price');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors min-w-[80px] justify-center"
              >
                Gain <span className="text-gray-500">{tpMode === 'percent' ? '%' : '$'}</span>
              </button>
            </div>

            {/* Stop Loss Row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={slMode === 'price' ? slPrice : slLoss}
                  onChange={(e) => {
                    if (slMode === 'price') {
                      setSlPrice(e.target.value);
                    } else {
                      setSlLoss(e.target.value);
                    }
                  }}
                  placeholder={slMode === 'price' ? 'SL Price' : 'Loss %'}
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#f6465d] transition-colors"
                />
              </div>
              <button
                onClick={() => {
                  if (slMode === 'price') {
                    if (slPrice) {
                      const pct = priceToPercent(parseFloat(slPrice), false);
                      setSlLoss(pct > 0 ? pct.toFixed(2) : '');
                    }
                    setSlMode('percent');
                  } else {
                    if (slLoss) {
                      const price = percentToPrice(parseFloat(slLoss), false);
                      setSlPrice(price > 0 ? price.toFixed(2) : '');
                    }
                    setSlMode('price');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-[#111111] border border-gray-700 rounded-lg text-sm text-gray-300 hover:border-gray-600 transition-colors min-w-[80px] justify-center"
              >
                Loss <span className="text-gray-500">{slMode === 'percent' ? '%' : '$'}</span>
              </button>
            </div>

            {/* Preview calculations */}
            {(hasTP || hasSL) && (
              <div className="text-xs text-gray-500 space-y-1 px-1">
                {hasTP && (
                  <div className="flex justify-between">
                    <span>TP triggers at</span>
                    <span className="text-[#16DE93]">
                      {getTPPrice() ? `$${parseFloat(getTPPrice()).toLocaleString()}` : '-'}
                    </span>
                  </div>
                )}
                {hasSL && (
                  <div className="flex justify-between">
                    <span>SL triggers at</span>
                    <span className="text-[#f6465d]">
                      {getSLPrice() ? `$${parseFloat(getSLPrice()).toLocaleString()}` : '-'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={isPending || (!hasTP && !hasSL)}
            className="w-full py-3 bg-gradient-to-r from-[#16DE93] to-[#16DE93] hover:from-[#16DE93] hover:to-[#16DE93] disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-normal rounded-lg transition-all text-sm"
          >
            {isPending ? 'Confirming...' : 'Confirm'}
          </button>

          {/* Disclaimer */}
          <p className="text-[11px] text-gray-600 text-center mt-4 leading-relaxed">
            By default take-profit and stop-loss orders apply to the entire position. A market order is triggered when the stop loss or take profit price is reached.
          </p>
        </div>
      </div>
    </div>
  );
}
