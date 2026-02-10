'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useOrdersStore } from '@/store/orders-store';
import { useTradingContext } from '@/hooks/use-trading-context';

interface HyperliquidHistoricalOrder {
  order: {
    coin: string;
    side: 'A' | 'B'; // A = Ask (Sell), B = Bid (Buy)
    limitPx: string;
    sz: string;
    oid: number;
    timestamp: number;
    origSz: string;
    cloid?: string;
    orderType?: {
      limit?: { tif: string };
      trigger?: { triggerPx: string; isMarket: boolean; tpsl: string };
    };
  };
  status: 'open' | 'filled' | 'canceled' | 'triggered' | 'rejected' | string;
  statusTimestamp?: number;
}

/**
 * Hook to fetch user order history from Hyperliquid
 */
export function useOrderHistory(limit: number = 100) {
  const { address, isConnected } = useAccount();
  const network = useNetworkStore((state) => state.network);
  const { setOrderHistory } = useOrdersStore();
  const { fetchAddress } = useTradingContext();

  const activeAddress = fetchAddress || address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['order-history', activeAddress, network, limit],
    queryFn: async () => {
      if (!activeAddress) return [];

      const client = getInfoClient(network);
      const historicalOrders = await client.getHistoricalOrders(activeAddress);

      return historicalOrders as HyperliquidHistoricalOrder[];
    },
    enabled: isConnected && !!activeAddress,
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });

  // Update orders store with transformed data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Filter to exclude currently open orders (they appear in the Open Orders tab)
      const historicalOnly = data.filter(
        (item: HyperliquidHistoricalOrder) => item.status !== 'open'
      );

      const transformedOrders = historicalOnly.slice(0, limit).map((item: HyperliquidHistoricalOrder) => {
        const order = item.order;
        const isMarketOrder = order.orderType?.trigger?.isMarket === true;

        return {
          id: order.oid.toString(),
          oid: order.oid,
          symbol: order.coin,
          side: (order.side === 'B' ? 'buy' : 'sell') as 'buy' | 'sell',
          type: (isMarketOrder ? 'market' : 'limit') as 'market' | 'limit',
          price: order.limitPx,
          size: order.origSz,
          filledSize: (parseFloat(order.origSz) - parseFloat(order.sz)).toFixed(4),
          status: item.status as 'filled' | 'cancelled' | 'rejected',
          timestamp: item.statusTimestamp || order.timestamp,
        };
      });

      setOrderHistory(transformedOrders);
    }
  }, [data, setOrderHistory, limit]);

  return {
    orders: data || [],
    isLoading,
    error,
    refetch,
  };
}
