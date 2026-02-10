import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient } from 'wagmi';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useNetworkStore } from '@/store/network-store';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

interface SetTPSLParams {
  symbol: string;
  side: 'long' | 'short';
  size: string; // Position size
  takeProfitPrice?: string;
  stopLossPrice?: string;
}

export function useSetTPSL() {
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const queryClient = useQueryClient();
  const { vaultAddress } = useTradingContext();

  return useMutation({
    mutationFn: async ({
      symbol,
      side,
      size,
      takeProfitPrice,
      stopLossPrice,
    }: SetTPSLParams) => {
      if (!walletClient) {
        throw new Error('Wallet not connected');
      }

      if (!takeProfitPrice && !stopLossPrice) {
        throw new Error('Must specify at least TP or SL');
      }

      const sizeNum = parseFloat(size);
      if (isNaN(sizeNum) || sizeNum <= 0) {
        throw new Error('Invalid size');
      }

      const exchangeClient = getExchangeClient(network);
      const results = [];

      // Place Take Profit order (opposite side, reduce only)
      if (takeProfitPrice) {
        const tpPriceNum = parseFloat(takeProfitPrice);
        if (isNaN(tpPriceNum) || tpPriceNum <= 0) {
          throw new Error('Invalid take profit price');
        }

        const nonceTp = generateNonce();
        const signatureTp = await signPlaceOrder(walletClient, {
          coin: symbol,
          isBuy: side === 'short', // Opposite side to close position
          size: sizeNum,
          limitPrice: tpPriceNum,
          reduceOnly: true,
          nonce: nonceTp,
          network,
        });

        const tpResult = await exchangeClient.placeOrder({
          coin: symbol,
          is_buy: side === 'short',
          sz: sizeNum,
          limit_px: tpPriceNum,
          order_type: {
            trigger: {
              triggerPx: tpPriceNum,
              isMarket: false,
              tpsl: 'tp',
            },
          },
          reduce_only: true,
          signature: signatureTp,
          nonce: nonceTp,
          vaultAddress,
        });

        if (!tpResult.success) {
          throw new Error(tpResult.error || 'Failed to set take profit');
        }

        results.push({ type: 'tp', data: tpResult.data });
      }

      // Place Stop Loss order (opposite side, reduce only)
      if (stopLossPrice) {
        const slPriceNum = parseFloat(stopLossPrice);
        if (isNaN(slPriceNum) || slPriceNum <= 0) {
          throw new Error('Invalid stop loss price');
        }

        const nonceSl = generateNonce() + 1; // Ensure unique nonce
        const signatureSl = await signPlaceOrder(walletClient, {
          coin: symbol,
          isBuy: side === 'short', // Opposite side to close position
          size: sizeNum,
          limitPrice: slPriceNum,
          reduceOnly: true,
          nonce: nonceSl,
          network,
        });

        const slResult = await exchangeClient.placeOrder({
          coin: symbol,
          is_buy: side === 'short',
          sz: sizeNum,
          limit_px: slPriceNum,
          order_type: {
            trigger: {
              triggerPx: slPriceNum,
              isMarket: true, // Stop loss is market order when triggered
              tpsl: 'sl',
            },
          },
          reduce_only: true,
          signature: signatureSl,
          nonce: nonceSl,
          vaultAddress,
        });

        if (!slResult.success) {
          throw new Error(slResult.error || 'Failed to set stop loss');
        }

        results.push({ type: 'sl', data: slResult.data });
      }

      return results;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch positions and orders
      queryClient.invalidateQueries({ queryKey: ['user-positions'] });
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });

      const messages = [];
      if (variables.takeProfitPrice) {
        messages.push(`TP @ ${variables.takeProfitPrice}`);
      }
      if (variables.stopLossPrice) {
        messages.push(`SL @ ${variables.stopLossPrice}`);
      }

      toast.success(`Set ${messages.join(' & ')} for ${variables.symbol}`);
    },
    onError: (error: Error) => {
      console.error('Set TP/SL failed:', error);
      toast.error(error.message || 'Failed to set TP/SL');
    },
  });
}
