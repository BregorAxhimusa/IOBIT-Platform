'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useVaultStore } from '@/store/vault-store';
import { useEffect } from 'react';
import type { UserVaultEquity } from '@/lib/hyperliquid/types';

/**
 * Hook to fetch user's vault equities (deposits in vaults)
 */
export function useUserVaults() {
  const network = useNetworkStore((state) => state.network);
  const { address, isConnected } = useAppKitAccount();
  const setUserVaultEquities = useVaultStore((state) => state.setUserVaultEquities);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-vault-equities', address, network],
    queryFn: async (): Promise<UserVaultEquity[]> => {
      if (!address) return [];

      const client = getInfoClient(network);
      const equities = await client.getUserVaultEquities(address);
      return equities;
    },
    enabled: isConnected && !!address,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Sync to store
  useEffect(() => {
    if (data) {
      setUserVaultEquities(data);
    }
  }, [data, setUserVaultEquities]);

  return {
    equities: data || [],
    isLoading,
    error,
    refetch,
  };
}
