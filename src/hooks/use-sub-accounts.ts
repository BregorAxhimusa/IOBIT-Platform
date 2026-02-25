'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useAccountStore } from '@/store/account-store';

/**
 * Hook to fetch sub-accounts for the connected master wallet
 */
export function useSubAccounts() {
  const { address, isConnected } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);
  const setSubAccounts = useAccountStore((state) => state.setSubAccounts);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sub-accounts', address, network],
    queryFn: async () => {
      if (!address) return [];

      const client = getInfoClient(network);
      const subAccounts = await client.getSubAccounts(address);
      return subAccounts;
    },
    enabled: isConnected && !!address,
    staleTime: 30000,
  });

  useEffect(() => {
    if (data) {
      setSubAccounts(data);
    }
  }, [data, setSubAccounts]);

  return {
    subAccounts: data || [],
    isLoading,
    error,
    refetch,
  };
}
