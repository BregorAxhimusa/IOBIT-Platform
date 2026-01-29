'use client';

import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useTradingStore } from '@/store/trading-store';
import { usePlaceOrder } from '@/hooks/use-place-order';
import { useTradingShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { cn } from '@/lib/utils/cn';

interface TradingPanelProps {
  symbol: string;
  currentPrice?: number;
}

export function TradingPanel({ symbol, currentPrice }: TradingPanelProps) {
  const { isConnected } = useAccount();
  const { open } = useAppKit();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { placeOrder, isPlacing } = usePlaceOrder();
  const priceInputRef = useRef<HTMLInputElement>(null);
  const sizeInputRef = useRef<HTMLInputElement>(null);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    orderType,
    orderSide,
    price,
    size,
    leverage,
    reduceOnly,
    postOnly,
    setOrderType,
    setOrderSide,
    setPrice,
    setSize,
    setLeverage,
    setReduceOnly,
    setPostOnly,
    resetForm,
  } = useTradingStore();

  // Keyboard shortcuts
  useTradingShortcuts({
    setBuySide: () => setOrderSide('buy'),
    setSellSide: () => setOrderSide('sell'),
    setMarketType: () => setOrderType('market'),
    setLimitType: () => setOrderType('limit'),
    focusPriceInput: () => priceInputRef.current?.focus(),
    focusSizeInput: () => sizeInputRef.current?.focus(),
    submitOrder: () => {
      if (isConnected && size && (orderType === 'market' || price)) {
        handlePlaceOrder();
      }
    },
  });

  const handlePlaceOrder = () => {
    if (!isConnected) {
      open();
      return;
    }

    // Show confirmation modal
    setShowConfirmation(true);
  };

  const handleConfirmOrder = async () => {
    const result = await placeOrder({
      symbol,
      side: orderSide,
      orderType,
      price: orderType === 'limit' ? price : undefined,
      size,
      leverage,
      reduceOnly,
      postOnly: orderType === 'limit' ? postOnly : undefined,
    });

    if (result.success) {
      resetForm();
      setShowConfirmation(false);
    }
  };

  const estimatedTotal = orderType === 'market' && currentPrice
    ? (parseFloat(size || '0') * currentPrice).toFixed(2)
    : orderType === 'limit' && price
    ? (parseFloat(size || '0') * parseFloat(price)).toFixed(2)
    : '0.00';

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white">Trade {symbol}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Order Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('market')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded transition-colors',
              orderType === 'market'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
          >
            Market <span className="text-xs opacity-60">(M)</span>
          </button>
          <button
            onClick={() => setOrderType('limit')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded transition-colors',
              orderType === 'limit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
          >
            Limit <span className="text-xs opacity-60">(L)</span>
          </button>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setOrderSide('buy')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded transition-colors',
              orderSide === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
          >
            Buy <span className="text-xs opacity-60">(B)</span>
          </button>
          <button
            onClick={() => setOrderSide('sell')}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded transition-colors',
              orderSide === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            )}
          >
            Sell <span className="text-xs opacity-60">(S)</span>
          </button>
        </div>

        {/* Price Input (only for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">Price (USD) <span className="text-gray-600 text-[10px]">Press P</span></label>
            <input
              ref={priceInputRef}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        {/* Size Input */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Size ({symbol}) <span className="text-gray-600 text-[10px]">Press A</span></label>
          <input
            ref={sizeInputRef}
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="0.0000"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Leverage Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400">Leverage</label>
            <span className="text-sm font-medium text-white">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>1x</span>
            <span>25x</span>
            <span>50x</span>
          </div>
        </div>

        {/* Order Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-300">Reduce Only</span>
          </label>

          {orderType === 'limit' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={postOnly}
                onChange={(e) => setPostOnly(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Post Only</span>
            </label>
          )}
        </div>

        {/* Estimated Total */}
        <div className="pt-2 border-t border-gray-800">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Total</span>
            <span className="text-white font-medium">${estimatedTotal}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handlePlaceOrder}
          disabled={!isConnected || !size || (orderType === 'limit' && !price)}
          className={cn(
            'w-full px-4 py-3 text-sm font-semibold rounded transition-colors',
            !isConnected
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : orderSide === 'buy'
              ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-700 disabled:text-gray-400'
              : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-700 disabled:text-gray-400'
          )}
          suppressHydrationWarning
        >
          {!mounted || !isConnected
            ? 'Connect Wallet'
            : orderSide === 'buy'
            ? `Buy ${symbol}`
            : `Sell ${symbol}`}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Order</h3>

            {/* Order Details */}
            <div className="space-y-3 mb-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Market</span>
                <span className="text-white font-medium">{symbol}/USD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Side</span>
                <span className={cn('font-medium', orderSide === 'buy' ? 'text-green-400' : 'text-red-400')}>
                  {orderSide.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Type</span>
                <span className="text-white font-medium capitalize">{orderType}</span>
              </div>
              {orderType === 'limit' && price && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price</span>
                  <span className="text-white font-medium">${parseFloat(price).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Size</span>
                <span className="text-white font-medium">{size} {symbol}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Leverage</span>
                <span className="text-white font-medium">{leverage}x</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-700 pt-3">
                <span className="text-gray-400">Estimated Total</span>
                <span className="text-white font-semibold">${estimatedTotal}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isPlacing}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={isPlacing}
                className={cn(
                  'flex-1 px-4 py-2 rounded transition-colors font-semibold',
                  orderSide === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white',
                  isPlacing && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isPlacing ? 'Placing...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
