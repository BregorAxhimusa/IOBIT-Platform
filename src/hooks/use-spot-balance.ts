'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useSpotStore } from '@/store/spot-store';
import type { SpotBalance } from '@/lib/hyperliquid/types';

export interface SpotBalanceWithValue extends SpotBalance {
  available: number;  // total - hold
  value: number;      // available * price (USD value)
}

/**
 * Hook për të marrë spot token balances për userin e lidhur
 */
export function useSpotBalance() {
  const { address, isConnected } = useAccount();
  const network = useNetworkStore((state) => state.network);
  const { setSpotBalances } = useSpotStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['spot-balance', address, network],
    queryFn: async () => {
      if (!address) return null;

      const client = getInfoClient(network);
      const state = await client.getSpotClearinghouseState(address);
      return state?.balances || [];
    },
    enabled: isConnected && !!address,
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // Sync to spot store
  useEffect(() => {
    if (data) {
      setSpotBalances(data);
    }
  }, [data, setSpotBalances]);

  // Get balance for specific token
  const getBalance = (tokenName: string): SpotBalance | undefined => {
    return data?.find((b) => b.coin === tokenName);
  };

  // Get USDC balance specifically
  const usdcBalance = data?.find((b) => b.coin === 'USDC');
  const availableUsdc = usdcBalance
    ? parseFloat(usdcBalance.total) - parseFloat(usdcBalance.hold)
    : 0;

  return {
    balances: data || [],
    availableUsdc,
    getBalance,
    isLoading,
    error,
    refetch,
  };
}
