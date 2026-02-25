'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signPlaceOrder, generateNonce } from '@/lib/hyperliquid/signing';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

/**
 * Hook for closing positions on Hyperliquid with real wallet signing
 * Closing a position places a market order in the opposite direction
 */
export function useClosePosition() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();
  const queryClient = useQueryClient();
  const [isClosing, setIsClosing] = useState(false);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);

  const closePosition = async (symbol: string, side: 'long' | 'short', size: string) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsClosing(true);
    setClosingSymbol(symbol);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin (remove -USD suffix if present)
      const coin = symbol.replace('-USD', '').replace('/USD', '');

      // Parse size
      const positionSize = parseFloat(size);

      if (isNaN(positionSize) || positionSize <= 0) {
        throw new Error('Invalid position size');
      }

      // To close a position, we place a market order in the opposite direction
      // with reduceOnly = true
      const isBuy = side === 'short'; // If we're short, we buy to close. If we're long, we sell to close.

      // Generate nonce
      const nonce = generateNonce();

      // For market orders, use a very favorable price to ensure immediate execution
      // Buy to close short: use very high price
      // Sell to close long: use very low price
      const limitPrice = isBuy ? 999999999 : 0.01;

      // Sign the order
      const signature = await signPlaceOrder(walletClient, {
        coin,
        isBuy,
        size: positionSize,
        limitPrice,
        reduceOnly: true, // IMPORTANT: This ensures we only close the position, not open a new one
        nonce,
        network,
      });

      // Prepare market order type - use IOC (Immediate Or Cancel) for market-like execution
      const order_type = { limit: { tif: 'Ioc' } };

      // Place the market order to close the position
      const result = await exchangeClient.placeOrder({
        coin,
        is_buy: isBuy,
        sz: positionSize,
        limit_px: limitPrice,
        order_type,
        reduce_only: true,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        // Invalidate queries to refetch positions and balance immediately
        queryClient.invalidateQueries({ queryKey: ['user-positions'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders'] });
        queryClient.invalidateQueries({ queryKey: ['account-balance'] });

        toast.success(`Position closed for ${symbol}`);
        return { success: true, data: result.data };
      } else {
        toast.error(`Failed to close position: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to close position: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsClosing(false);
      setClosingSymbol(null);
    }
  };

  return {
    closePosition,
    isClosing,
    closingSymbol,
  };
}
