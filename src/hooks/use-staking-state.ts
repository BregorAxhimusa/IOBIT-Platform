'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import type { StakingState, Delegation } from '@/lib/hyperliquid/types';

export function useStakingState() {
  const { address } = useAccount();
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

  return {
    stakingState: stateQuery.data ?? null,
    delegations: delegationsQuery.data ?? [],
    isLoading: stateQuery.isLoading || delegationsQuery.isLoading,
    refetch: () => {
      stateQuery.refetch();
      delegationsQuery.refetch();
    },
  };
}
