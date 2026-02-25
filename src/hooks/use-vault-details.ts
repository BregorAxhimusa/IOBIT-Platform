'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useVaultStore } from '@/store/vault-store';
import { useEffect } from 'react';
import type { VaultDetails } from '@/lib/hyperliquid/types';

/**
 * Hook to fetch detailed info for a specific vault
 */
export function useVaultDetails(vaultAddress: string) {
  const network = useNetworkStore((state) => state.network);
  const { address } = useAppKitAccount();
  const setSelectedVault = useVaultStore((state) => state.setSelectedVault);
  const setLoadingDetails = useVaultStore((state) => state.setLoadingDetails);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vault-details', vaultAddress, address, network],
    queryFn: async (): Promise<VaultDetails | null> => {
      if (!vaultAddress) return null;

      const client = getInfoClient(network);
      const details = await client.getVaultDetails(vaultAddress, address);
      return details;
    },
    enabled: !!vaultAddress,
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Sync to store
  useEffect(() => {
    if (data) {
      setSelectedVault(data);
    }
    return () => {
      setSelectedVault(null);
    };
  }, [data, setSelectedVault]);

  useEffect(() => {
    setLoadingDetails(isLoading);
  }, [isLoading, setLoadingDetails]);

  return {
    vault: data,
    isLoading,
    error,
    refetch,
  };
}
