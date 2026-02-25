'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useTradingContext } from '@/hooks/use-trading-context';

interface HyperliquidFill {
  coin: string;
  px: string;
  sz: string;
  side: string;
  time: number;
  startPosition: string;
  dir: string;
  closedPnl: string;
  hash: string;
  oid: number;
  crossed: boolean;
  fee: string;
  tid: number;
}

interface TradeHistoryItem {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: string;
  size: string;
  fee: string;
  timestamp: number;
  realizedPnl?: string;
}

/**
 * Hook to fetch user trade history from Hyperliquid
 */
export function useUserTradeHistory(limit: number = 50) {
  const { address, isConnected } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);
  const { fetchAddress } = useTradingContext();

  const activeAddress = fetchAddress || address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-trade-history', activeAddress, network, limit],
    queryFn: async () => {
      if (!activeAddress) return [];

      const client = getInfoClient(network);
      const fills = await client.getUserFills(activeAddress);

      // Transform Hyperliquid fills to TradeHistoryItem format
      if (Array.isArray(fills) && fills.length > 0) {
        const transformedTrades: TradeHistoryItem[] = fills
          .slice(0, limit)
          .map((fill: HyperliquidFill) => ({
            id: `${fill.tid}-${fill.hash}`,
            symbol: fill.coin,
            side: fill.side.toLowerCase() === 'a' ? 'sell' : 'buy',
            price: fill.px,
            size: fill.sz,
            fee: fill.fee,
            timestamp: fill.time,
            realizedPnl: fill.closedPnl !== '0' ? fill.closedPnl : undefined,
          }));

        return transformedTrades;
      }

      return [] as TradeHistoryItem[];
    },
    enabled: isConnected && !!activeAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });

  return {
    trades: data || [],
    isLoading,
    error,
    refetch,
  };
}
