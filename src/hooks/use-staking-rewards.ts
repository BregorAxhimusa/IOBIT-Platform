'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import type { DelegatorReward, DelegatorHistoryEvent } from '@/lib/hyperliquid/types';

export function useStakingRewards() {
  const { address } = useAccount();
  const network = useNetworkStore((state) => state.network);

  const rewardsQuery = useQuery<DelegatorReward[]>({
    queryKey: ['delegator-rewards', address, network],
    queryFn: async () => {
      if (!address) return [];
      const client = getInfoClient(network);
      return client.getDelegatorRewards(address);
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const historyQuery = useQuery<DelegatorHistoryEvent[]>({
    queryKey: ['delegator-history', address, network],
    queryFn: async () => {
      if (!address) return [];
      const client = getInfoClient(network);
      return client.getDelegatorHistory(address);
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const rewards = rewardsQuery.data ?? [];
  const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.totalAmount || '0'), 0);

  return {
    rewards,
    history: historyQuery.data ?? [],
    totalRewards,
    isLoading: rewardsQuery.isLoading || historyQuery.isLoading,
  };
}
