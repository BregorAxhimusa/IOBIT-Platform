import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';
import toast from 'react-hot-toast';

interface PlaceStopOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  size: string;
  triggerPrice: string;
  orderType: 'stop-market' | 'stop-limit';
  limitPrice?: string; // Required for stop-limit
  reduceOnly?: boolean;
  tpsl?: 'tp' | 'sl'; // Take profit or stop loss
}

export function usePlaceStopOrder() {
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      symbol,
      side,
      size,
      triggerPrice,
      orderType,
      limitPrice,
      reduceOnly = false,
      tpsl = 'sl',
    }: PlaceStopOrderParams) => {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      const sizeNum = parseFloat(size);
      const triggerPriceNum = parseFloat(triggerPrice);

      if (isNaN(sizeNum) || sizeNum <= 0) {
        throw new Error('Invalid order size');
      }

      if (isNaN(triggerPriceNum) || triggerPriceNum <= 0) {
        throw new Error('Invalid trigger price');
      }

      // For stop-limit, validate limit price
      let limitPriceNum = triggerPriceNum;
      if (orderType === 'stop-limit') {
        if (!limitPrice) {
          throw new Error('Limit price required for stop-limit order');
        }
        limitPriceNum = parseFloat(limitPrice);
        if (isNaN(limitPriceNum) || limitPriceNum <= 0) {
          throw new Error('Invalid limit price');
        }
      }

      const nonce = generateNonce();

      // Sign the order (same signature as regular order)
      const signature = await signPlaceOrder(walletClient, {
        coin: symbol,
        isBuy: side === 'buy',
        size: sizeNum,
        limitPrice: limitPriceNum,
        reduceOnly,
        nonce,
        network,
      });

      // Place the order with trigger
      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.placeOrder({
        coin: symbol,
        is_buy: side === 'buy',
        sz: sizeNum,
        limit_px: limitPriceNum,
        order_type: {
          trigger: {
            triggerPx: triggerPriceNum,
            isMarket: orderType === 'stop-market',
            tpsl,
          },
        },
        reduce_only: reduceOnly,
        signature,
        nonce,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to place stop order');
      }

      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch orders
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });

      const orderTypeText =
        variables.orderType === 'stop-market' ? 'Stop Market' : 'Stop Limit';
      toast.success(
        `${orderTypeText} order placed: ${variables.side.toUpperCase()} ${
          variables.size
        } ${variables.symbol} @ trigger ${variables.triggerPrice}`
      );
    },
    onError: (error: Error) => {
      console.error('Stop order failed:', error);
      toast.error(error.message || 'Failed to place stop order');
    },
  });
}
