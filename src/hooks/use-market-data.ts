'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useMarketStore } from '@/store/market-store';
import { useWebSocket } from './use-websocket';

/**
 * Hook to fetch market data and subscribe to real-time updates
 * @param symbol - Optional specific symbol to fetch
 */
export function useMarketData(symbol?: string) {
  const network = useNetworkStore((state) => state.network);
  const { subscribeToAllMids, unsubscribe } = useWebSocket();
  const { updateMarkets, setLoading, setError } = useMarketStore();

  // Fetch initial market data
  const { data, isLoading, error } = useQuery({
    queryKey: ['market-data', symbol, network],
    queryFn: async () => {
      const client = getInfoClient(network);

      // Get all markets with full data
      const [mids, metaAndAssetCtxs] = await Promise.all([
        client.getAllMids(),
        client.getMetaAndAssetCtxs(),
      ]);

      return { mids, metaAndAssetCtxs };
    },
    staleTime: 5000,
    refetchInterval: 10000, // Refetch every 10s as fallback
  });

  // Process initial data and populate market store
  useEffect(() => {
    if (data && typeof data === 'object') {
      const responseData = data as {
        mids?: Record<string, string>;
        metaAndAssetCtxs?: [
          { universe: { name: string }[] },
          {
            markPx: string;
            midPx: string;
            prevDayPx: string;
            dayNtlVlm: string;
            funding: string;
            openInterest: string;
          }[]
        ];
      };

      const midsData = responseData.mids || {};
      const metaAndAssetCtxs = responseData.metaAndAssetCtxs;

      if (!metaAndAssetCtxs || !Array.isArray(metaAndAssetCtxs)) {
        console.error('Invalid metaAndAssetCtxs structure');
        return;
      }

      const [meta, assetCtxs] = metaAndAssetCtxs;
      const universe = meta?.universe || [];

      const updates: [string, Partial<{
        symbol: string;
        price: string;
        markPrice: string;
        prevDayPrice: string;
        change24h: number;
        volume24h: string;
        funding: string;
        openInterest: string;
      }>][] = universe.map((asset, index) => {
        const assetCtx = assetCtxs[index];
        const midPrice = midsData[asset.name] || assetCtx?.midPx || assetCtx?.markPx || '0';
        const currentPrice = parseFloat(midPrice);
        const prevDayPx = parseFloat(assetCtx?.prevDayPx || '0');
        const change24h = prevDayPx > 0
          ? ((currentPrice - prevDayPx) / prevDayPx) * 100
          : 0;

        return [
          asset.name,
          {
            symbol: asset.name,
            price: midPrice,
            markPrice: assetCtx?.markPx || midPrice,
            prevDayPrice: assetCtx?.prevDayPx || '0',
            change24h,
            volume24h: assetCtx?.dayNtlVlm || '0',
            funding: assetCtx?.funding || '0',
            openInterest: assetCtx?.openInterest || '0',
          },
        ];
      });

      updateMarkets(updates);
    }
  }, [data, updateMarkets]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscriptionId = subscribeToAllMids((data) => {
      // Type guard for allMids data
      if (typeof data !== 'object' || data === null) return;

      // Hyperliquid sends data as direct object {BTC: "50000", ETH: "3000", ...}
      const midsData = data as Record<string, string>;

      const updates: [string, Partial<{ symbol: string; price: string; markPrice: string }>][] = Object.entries(midsData).map(([symbol, price]) => [
        symbol,
        {
          symbol,
          price: price as string,
          markPrice: price as string,
        },
      ]);

      updateMarkets(updates);
    });

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [subscribeToAllMids, unsubscribe, updateMarkets]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  // Update error state
  useEffect(() => {
    setError(error ? error.message : null);
  }, [error, setError]);

  return {
    data,
    isLoading,
    error,
  };
}

/**
 * Hook for specific symbol data
 */
export function useSymbolData(symbol: string) {
  const market = useMarketStore((state) => state.getMarket(symbol));
  const { data, isLoading } = useMarketData(symbol);

  return {
    market,
    data,
    isLoading,
  };
}
