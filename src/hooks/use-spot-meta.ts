'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useSpotStore } from '@/store/spot-store';

/**
 * Hook për të marrë spot metadata dhe asset contexts
 * Populates the spot store with market data
 */
export function useSpotMeta() {
  const network = useNetworkStore((state) => state.network);
  const { setSpotMeta, setSpotAssetCtxs, setLoading, setError } = useSpotStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['spot-meta-and-ctxs', network],
    queryFn: async () => {
      const client = getInfoClient(network);
      const result = await client.getSpotMetaAndAssetCtxs();
      return result;
    },
    staleTime: 10000,
    refetchInterval: 15000,
  });

  // Populate spot store when data arrives
  useEffect(() => {
    if (data) {
      const [meta, ctxs] = data;
      setSpotMeta(meta);
      setSpotAssetCtxs(ctxs);
    }
  }, [data, setSpotMeta, setSpotAssetCtxs]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setError(error ? error.message : null);
  }, [error, setError]);

  return {
    spotMeta: data ? data[0] : null,
    spotAssetCtxs: data ? data[1] : [],
    isLoading,
    error,
  };
}
