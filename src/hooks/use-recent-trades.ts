'use client';

import { useEffect } from 'react';
import { useWebSocket } from './use-websocket';
import { useTradesStore } from '@/store/trades-store';

/**
 * Hook for recent trades with real-time WebSocket updates
 */
export function useRecentTrades(symbol: string) {
  const { subscribeToTrades, unsubscribe } = useWebSocket();
  const { addTrades, getTrades } = useTradesStore();

  // Subscribe to real-time trades
  useEffect(() => {
    const subscriptionId = subscribeToTrades(symbol, (data) => {
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
  }, [symbol, subscribeToTrades, unsubscribe, addTrades]);

  return {
    trades: getTrades(symbol),
  };
}
