'use client';

import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useVaultStore } from '@/store/vault-store';
import { useEffect } from 'react';
import type { VaultStatsData } from '@/lib/hyperliquid/types';

/**
 * Hook to fetch vaults list with fallback to stats-data endpoint
 */
export function useVaults() {
  const network = useNetworkStore((state) => state.network);
  const setVaultStats = useVaultStore((state) => state.setVaultStats);
  const setLoading = useVaultStore((state) => state.setLoading);
  const setError = useVaultStore((state) => state.setError);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vaults-list', network],
    queryFn: async (): Promise<VaultStatsData[]> => {
      const client = getInfoClient(network);

      // Try stats-data endpoint first (more reliable)
      const statsData = await client.getVaultsList();
      if (statsData && statsData.length > 0) {
        return statsData;
      }

      // Fallback: try vaultSummaries from info endpoint
      const summaries = await client.getVaultSummaries();
      if (summaries && summaries.length > 0) {
        // Map VaultSummary to VaultStatsData format
        return summaries.map((s: unknown) => {
          const summary = s as {
            vaultAddress: string;
            name: string;
            leader: string;
            tvl: string;
            apr: number;
            pnl: string;
            followerCount: number;
            leaderCommission: number;
            isClosed: boolean;
          };
          return {
            vaultAddress: summary.vaultAddress,
            name: summary.name,
            leader: summary.leader,
            tvl: parseFloat(summary.tvl) || 0,
            apr30d: summary.apr || 0,
            allTimePnl: parseFloat(summary.pnl) || 0,
            followerCount: summary.followerCount || 0,
            leaderCommission: summary.leaderCommission || 0,
            isClosed: summary.isClosed || false,
          };
        });
      }

      return [];
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Sync to store
  useEffect(() => {
    if (data) {
      setVaultStats(data);
    }
  }, [data, setVaultStats]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch vaults');
    }
  }, [error, setError]);

  return {
    vaults: data || [],
    isLoading,
    error,
    refetch,
  };
}
