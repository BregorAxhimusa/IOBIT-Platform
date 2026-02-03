'use client';

import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { signTwapOrder, generateNonce } from '@/lib/hyperliquid/signing';
import toast from 'react-hot-toast';

export interface TwapOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  size: string;
  durationMinutes: number;
  randomTiming: boolean;
  reduceOnly?: boolean;
}

/**
 * Hook for placing TWAP orders on Hyperliquid
 */
export function useTwapOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const [isPlacing, setIsPlacing] = useState(false);

  const placeTwapOrder = async (params: TwapOrderParams) => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return { success: false, error: 'Wallet not connected' };
    }

    if (!walletClient) {
      toast.error('Wallet client not available');
      return { success: false, error: 'Wallet client not available' };
    }

    setIsPlacing(true);

    try {
      const exchangeClient = getExchangeClient(network);

      // Convert symbol to coin
      const coin = params.symbol.replace('-USD', '').replace('/USD', '');

      // Parse size
      const size = parseFloat(params.size);
      if (isNaN(size) || size <= 0) {
        throw new Error('Invalid order size');
      }

      // Validate duration
      if (params.durationMinutes < 5 || params.durationMinutes > 1440) {
        throw new Error('Duration must be between 5 and 1440 minutes');
      }

      // Generate nonce
      const nonce = generateNonce();

      // Sign the TWAP order
      const signature = await signTwapOrder(walletClient, {
        coin,
        isBuy: params.side === 'buy',
        size,
        durationMinutes: params.durationMinutes,
        randomTiming: params.randomTiming,
        reduceOnly: params.reduceOnly || false,
        nonce,
        network,
      });

      // Place the TWAP order
      const result = await exchangeClient.placeTwapOrder({
        coin,
        is_buy: params.side === 'buy',
        sz: size,
        duration_minutes: params.durationMinutes,
        random_timing: params.randomTiming,
        reduce_only: params.reduceOnly || false,
        signature,
        nonce,
      });

      if (result.success) {
        toast.success(`TWAP ${params.side.toUpperCase()} order started (${params.durationMinutes} min)`);
        return { success: true, data: result.data };
      } else {
        toast.error(`TWAP order failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to place TWAP order: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsPlacing(false);
    }
  };

  return {
    placeTwapOrder,
    isPlacing,
  };
}
