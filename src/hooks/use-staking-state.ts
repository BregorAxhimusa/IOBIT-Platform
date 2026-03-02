'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { nativeToHype } from '@/lib/utils/format';
import type { StakingState, Delegation } from '@/lib/hyperliquid/types';

export function useStakingState() {
  const { address } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);

  const stateQuery = useQuery<StakingState | null>({
    queryKey: ['staking-state', address, network],
    queryFn: async () => {
      if (!address) return null;
      const client = getInfoClient(network);
      return client.getStakingState(address);
    },
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const delegationsQuery = useQuery<Delegation[]>({
    queryKey: ['delegations', address, network],
    queryFn: async () => {
      if (!address) return [];
      const client = getInfoClient(network);
      return client.getDelegations(address);
    },
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // Convert native staking units to HYPE for display and operations
  const stakingState = useMemo(() => {
    const raw = stateQuery.data;
    if (!raw) return null;
    return {
      ...raw,
      delegated: nativeToHype(raw.delegated),
      undelegated: nativeToHype(raw.undelegated),
      totalPendingWithdrawal: nativeToHype(raw.totalPendingWithdrawal),
    };
  }, [stateQuery.data]);

  const delegations = useMemo(() =>
    (delegationsQuery.data ?? []).map((d) => ({ ...d, amount: nativeToHype(d.amount) })),
    [delegationsQuery.data]
  );

  return {
    stakingState,
    delegations,
    isLoading: stateQuery.isLoading || delegationsQuery.isLoading,
    refetch: () => {
      stateQuery.refetch();
      delegationsQuery.refetch();
    },
  };
}
