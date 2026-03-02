'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { useNetworkStore } from '@/store/network-store';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { nativeToHype } from '@/lib/utils/format';
import type { DelegatorReward, DelegatorHistoryEvent } from '@/lib/hyperliquid/types';

export function useStakingRewards() {
  const { address } = useAppKitAccount();
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

  // Convert native staking units to HYPE
  const rewards = useMemo(() =>
    (rewardsQuery.data ?? []).map((r) => ({ ...r, totalAmount: nativeToHype(r.totalAmount) })),
    [rewardsQuery.data]
  );

  const history = useMemo(() =>
    (historyQuery.data ?? []).map((h) => ({
      ...h,
      delta: {
        delegate: h.delta.delegate ? { ...h.delta.delegate, amount: nativeToHype(h.delta.delegate.amount) } : undefined,
        withdrawal: h.delta.withdrawal ? { ...h.delta.withdrawal, amount: nativeToHype(h.delta.withdrawal.amount) } : undefined,
        deposit: h.delta.deposit ? { ...h.delta.deposit, amount: nativeToHype(h.delta.deposit.amount) } : undefined,
      },
    })),
    [historyQuery.data]
  );

  const totalRewards = rewards.reduce((sum, r) => sum + parseFloat(r.totalAmount || '0'), 0);

  return {
    rewards,
    history,
    totalRewards,
    isLoading: rewardsQuery.isLoading || historyQuery.isLoading,
  };
}
