'use client';

import { useEffect, useMemo } from 'react';
import { useWebSocket } from './use-websocket';
import { useTradesStore } from '@/store/trades-store';
import { useMarketStore } from '@/store/market-store';
import { useSpotStore } from '@/store/spot-store';
import { getSpotCoinName } from '@/lib/utils/spot-helpers';

/**
 * Hook for recent trades with real-time WebSocket updates
 * Supports both perp and spot symbols
 */
export function useRecentTrades(symbol: string) {
  const marketType = useMarketStore((state) => state.marketType);
  const spotMeta = useSpotStore((state) => state.spotMeta);
  const { subscribeToTrades, unsubscribe } = useWebSocket();
  const { addTrades, getTrades } = useTradesStore();

  // Resolve coin name for API
  const apiCoin = useMemo(() => {
    if (marketType === 'spot' && spotMeta) {
      const pair = spotMeta.universe.find((p) => p.name === symbol);
      if (pair) return getSpotCoinName(pair.index);
    }
    return symbol;
  }, [symbol, marketType, spotMeta]);

  // Subscribe to real-time trades
  useEffect(() => {
    const subscriptionId = subscribeToTrades(apiCoin, (data) => {
      // Type guard
      if (typeof data !== 'object' || data === null) return;
      if (!Array.isArray(data)) return;

      const tradesData = data as Array<{
        px: string;
        sz: string;
        side: string;
        time: number;
      }>;

      // Transform to our format
      const trades = tradesData.map((trade) => ({
        price: trade.px,
        size: trade.sz,
        side: trade.side === 'B' ? ('buy' as const) : ('sell' as const),
        time: trade.time,
      }));

      addTrades(symbol, trades);
    });

    return () => {
      unsubscribe(subscriptionId);
    };
  }, [apiCoin, symbol, subscribeToTrades, unsubscribe, addTrades]);

  return {
    trades: getTrades(symbol),
  };
}
