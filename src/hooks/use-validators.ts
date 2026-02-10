'use client';

import { useQuery } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import type { ValidatorSummary } from '@/lib/hyperliquid/types';

export function useValidators() {
  const network = useNetworkStore((state) => state.network);

  const query = useQuery<ValidatorSummary[]>({
    queryKey: ['validators', network],
    queryFn: async () => {
      const client = getInfoClient(network);
      return client.getValidatorSummaries();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  return {
    validators: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
