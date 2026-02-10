'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getExchangeClient } from '@/lib/hyperliquid/exchange-client';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { signTwapOrder, signTwapCancel, generateNonce } from '@/lib/hyperliquid/signing';
import { useTradingContext } from '@/hooks/use-trading-context';
import toast from 'react-hot-toast';

export interface TwapOrderParams {
  symbol: string;
  side: 'buy' | 'sell';
  size: string;
  durationMinutes: number;
  randomTiming: boolean;
  reduceOnly?: boolean;
}

export interface ActiveTwap {
  twapId: number;
  symbol: string;
  side: 'buy' | 'sell';
  totalSize: number;
  executedSize: number;
  totalSlices: number;
  executedSlices: number;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  status: 'active' | 'completed' | 'cancelled';
}

const ASSET_INDEX_MAP: Record<string, number> = {
  'BTC': 0, 'ETH': 1, 'SOL': 2, 'ARB': 3, 'AVAX': 4, 'BCH': 5,
  'BNB': 6, 'DOGE': 7, 'LTC': 8, 'MATIC': 9, 'OP': 10, 'XRP': 11,
};

/**
 * Hook for placing and managing TWAP orders on Hyperliquid
 */
export function useTwapOrder() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const network = useNetworkStore((state) => state.network);
  const { vaultAddress } = useTradingContext();
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeTwap, setActiveTwap] = useState<ActiveTwap | null>(null);

  // Track TWAP fills when there's an active TWAP
  const { data: twapFills } = useQuery({
    queryKey: ['twap-fills', address, activeTwap?.twapId],
    queryFn: async () => {
      if (!address) return [];
      const infoClient = getInfoClient(network);
      return infoClient.getUserTwapSliceFills(address);
    },
    enabled: !!address && !!activeTwap && activeTwap.status === 'active',
    refetchInterval: 5000,
  });

  // Update progress when fills change
  useEffect(() => {
    if (twapFills && activeTwap && activeTwap.status === 'active' && Array.isArray(twapFills)) {
      const relevantFills = twapFills.filter(
        (f: { twapId?: number }) => f.twapId === activeTwap.twapId
      );
      const executedSize = relevantFills.reduce(
        (sum: number, f: { sz?: string }) => sum + parseFloat(f.sz || '0'), 0
      );

      setActiveTwap(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          executedSlices: relevantFills.length,
          executedSize,
        };
        // Check if completed
        if (Date.now() >= prev.endTime || executedSize >= prev.totalSize * 0.99) {
          updated.status = 'completed' as const;
        }
        return updated;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Using specific activeTwap properties to avoid infinite re-render loop
  }, [twapFills, activeTwap?.twapId, activeTwap?.status, activeTwap?.endTime, activeTwap?.totalSize]);

  // Auto-clear completed TWAP after 10 seconds
  useEffect(() => {
    if (activeTwap?.status === 'completed' || activeTwap?.status === 'cancelled') {
      const timer = setTimeout(() => setActiveTwap(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [activeTwap?.status]);

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
      const coin = params.symbol.replace('-USD', '').replace('/USD', '');
      const size = parseFloat(params.size);

      if (isNaN(size) || size <= 0) {
        throw new Error('Invalid order size');
      }

      if (params.durationMinutes < 5 || params.durationMinutes > 1440) {
        throw new Error('Duration must be between 5 and 1440 minutes');
      }

      const nonce = generateNonce();

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

      const result = await exchangeClient.placeTwapOrder({
        coin,
        is_buy: params.side === 'buy',
        sz: size,
        duration_minutes: params.durationMinutes,
        random_timing: params.randomTiming,
        reduce_only: params.reduceOnly || false,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        // Extract TWAP ID from response
        const responseData = result.data as { response?: { data?: { twapId?: number } } };
        const twapId = responseData?.response?.data?.twapId || nonce;

        // Estimate slices (roughly every 30 seconds for short TWAPs, up to 2 min for longer)
        const sliceInterval = Math.max(30, Math.min(120, params.durationMinutes * 60 / 10));
        const totalSlices = Math.ceil((params.durationMinutes * 60) / sliceInterval);

        setActiveTwap({
          twapId,
          symbol: params.symbol,
          side: params.side,
          totalSize: size,
          executedSize: 0,
          totalSlices,
          executedSlices: 0,
          startTime: Date.now(),
          endTime: Date.now() + params.durationMinutes * 60 * 1000,
          durationMinutes: params.durationMinutes,
          status: 'active',
        });

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

  const cancelTwap = useCallback(async () => {
    if (!walletClient || !address || !activeTwap) {
      toast.error('No active TWAP to cancel');
      return;
    }

    setIsCancelling(true);

    try {
      const coin = activeTwap.symbol.replace('-USD', '').replace('/USD', '');
      const assetIndex = ASSET_INDEX_MAP[coin];

      if (assetIndex === undefined) {
        throw new Error(`Unknown coin: ${coin}`);
      }

      const nonce = generateNonce();
      const signature = await signTwapCancel(walletClient, {
        assetIndex,
        twapId: activeTwap.twapId,
        nonce,
        network,
      });

      const exchangeClient = getExchangeClient(network);
      const result = await exchangeClient.cancelTwapOrder({
        coin,
        twapId: activeTwap.twapId,
        signature,
        nonce,
        vaultAddress,
      });

      if (result.success) {
        setActiveTwap(prev => prev ? { ...prev, status: 'cancelled' } : null);
        toast.success('TWAP order cancelled');
      } else {
        toast.error(`Failed to cancel TWAP: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to cancel TWAP: ${errorMessage}`);
    } finally {
      setIsCancelling(false);
    }
  }, [walletClient, address, activeTwap, network, vaultAddress]);

  return {
    placeTwapOrder,
    cancelTwap,
    isPlacing,
    isCancelling,
    activeTwap,
  };
}
