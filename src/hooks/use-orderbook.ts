'use client';

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useOrderBookStore } from '@/store/orderbook-store';
import { useMarketStore } from '@/store/market-store';
import { useSpotStore } from '@/store/spot-store';
import { getSpotCoinName } from '@/lib/utils/spot-helpers';
import { useWebSocket } from './use-websocket';

/**
 * Hook for order book data with real-time WebSocket updates
 * Supports both perp (e.g. "BTC") and spot (e.g. "PURR/USDC") symbols
 */
export function useOrderBook(symbol: string) {
  const network = useNetworkStore((state) => state.network);
  const marketType = useMarketStore((state) => state.marketType);
  const spotMeta = useSpotStore((state) => state.spotMeta);
  const { subscribeToL2Book, unsubscribe } = useWebSocket();
  const { setOrderBook, getOrderBook } = useOrderBookStore();

  // Resolve coin name for API: perps use symbol directly, spot uses @pairIndex
  const apiCoin = useMemo(() => {
    if (marketType === 'spot' && spotMeta) {
      const pair = spotMeta.universe.find((p) => p.name === symbol);
      if (pair) return getSpotCoinName(pair.index);
    }
    return symbol;
  }, [symbol, marketType, spotMeta]);

  // Fetch initial order book data
  const { data, isLoading, error } = useQuery({
    queryKey: ['orderbook', apiCoin, network],
    queryFn: async () => {
      const client = getInfoClient(network);
      const book = await client.getL2Book(apiCoin);
      return book;
    },
    staleTime: 2000,
    refetchInterval: 5000, // Refetch every 5s as fallback
  });

  // Update store with initial data
  useEffect(() => {
    if (data) {
      const bids = (data.levels[0] || []).map((level: { px: string; sz: string }) => ({
        price: level.px,
        size: level.sz,
      }));

      const asks = (data.levels[1] || []).map((level: { px: string; sz: string }) => ({
        price: level.px,
        size: level.sz,
      }));

      setOrderBook(symbol, {
        coin: symbol,
        bids,
        asks,
        timestamp: Date.now(),
      });
    }
  }, [data, symbol, setOrderBook]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscriptionId = subscribeToL2Book(apiCoin, (data) => {
      // Type guard
      if (typeof data !== 'object' || data === null) return;

      const bookData = data as {
        coin: string;
        levels: [Array<{ px: string; sz: string; n: number }>, Array<{ px: string; sz: string; n: number }>];
        time: number;
      };

      // Transform to our format
      const bids = bookData.levels[0].map((level) => ({
        price: level.px,
        size: level.sz,
      }));

      const asks = bookData.levels[1].map((level) => ({
        price: level.px,
        size: level.sz,
      }));

      setOrderBook(symbol, {
        coin: symbol,
        bids,
        asks,
        timestamp: bookData.time,
      });
    });

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [apiCoin, symbol, subscribeToL2Book, unsubscribe, setOrderBook]);

  return {
    orderBook: getOrderBook(symbol),
    isLoading,
    error,
  };
}
