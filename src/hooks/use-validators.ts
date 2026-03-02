'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { nativeToHype } from '@/lib/utils/format';
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

  // Convert native staking units to HYPE for display
  const validators = useMemo(() =>
    (query.data ?? []).map((v) => ({ ...v, stake: nativeToHype(v.stake) })),
    [query.data]
  );

  return {
    validators,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
