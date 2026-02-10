'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import type { UserFees } from '@/lib/hyperliquid/types';

export function useUserFees() {
  const { address } = useAccount();
  const network = useNetworkStore((state) => state.network);

  const query = useQuery<UserFees | null>({
    queryKey: ['user-fees', address, network],
    queryFn: async () => {
      if (!address) return null;
      const client = getInfoClient(network);
      return client.getUserFees(address);
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  return {
    userFees: query.data ?? null,
    isLoading: query.isLoading,
  };
}
