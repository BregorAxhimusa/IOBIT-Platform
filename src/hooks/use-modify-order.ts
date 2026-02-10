import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';
import { useOrdersStore } from '@/store/orders-store';
import toast from 'react-hot-toast';

interface ModifyOrderParams {
  oid: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  size: string;
  reduceOnly?: boolean;
  timeInForce?: 'GTC' | 'IOC' | 'ALO';
}

export function useModifyOrder() {
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const updateOrder = useOrdersStore((state) => state.updateOrder);

  return useMutation({
    mutationFn: async ({
      oid,
      symbol,
      side,
      price,
      size,
      reduceOnly = false,
      timeInForce = 'GTC',
    }: ModifyOrderParams) => {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      const priceNum = parseFloat(price);
      const sizeNum = parseFloat(size);

      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Invalid price');
      }

      if (isNaN(sizeNum) || sizeNum <= 0) {
        throw new Error('Invalid size');
      }

      const nonce = generateNonce();

      // Sign the order (modify uses same signature as place)
      const signature = await signPlaceOrder(walletClient, {
        coin: symbol,
        isBuy: side === 'buy',
        size: sizeNum,
        limitPrice: priceNum,
        reduceOnly,
        nonce,
        network,
      });

      // Map timeInForce to Hyperliquid format
      const tifMap: Record<string, string> = {
        GTC: 'Gtc',
        IOC: 'Ioc',
        ALO: 'Alo',
      };

      // Send modify request
      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.modifyOrder({
        oid,
        coin: symbol,
        is_buy: side === 'buy',
        sz: sizeNum,
        limit_px: priceNum,
        order_type: { limit: { tif: tifMap[timeInForce] } },
        reduce_only: reduceOnly,
        signature,
        nonce,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to modify order');
      }

      return { oid, data: result.data };
    },
    onSuccess: (data, variables) => {
      // Update local store
      updateOrder(variables.oid.toString(), {
        price: variables.price,
        size: variables.size,
      });

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });

      toast.success('Order modified successfully');
    },
    onError: (error: Error) => {
      console.error('Modify order failed:', error);
      toast.error(error.message || 'Failed to modify order');
    },
  });
}
