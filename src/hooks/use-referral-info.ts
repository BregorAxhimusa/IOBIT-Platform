'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import type { ReferralInfo } from '@/lib/hyperliquid/types';

export function useReferralInfo() {
  const { address } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);

  const query = useQuery<ReferralInfo | null>({
    queryKey: ['referral-info', address, network],
    queryFn: async () => {
      if (!address) return null;
      const client = getInfoClient(network);
      return client.getReferralInfo(address);
    },
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    referralInfo: query.data ?? null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
