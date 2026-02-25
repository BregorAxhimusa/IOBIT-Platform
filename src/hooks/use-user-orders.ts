'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useOrdersStore } from '@/store/orders-store';
import { useTradingContext } from '@/hooks/use-trading-context';

interface HyperliquidOrder {
  coin: string;
  side: 'A' | 'B'; // A = Ask (Sell), B = Bid (Buy)
  limitPx: string;
  sz: string;
  oid: number;
  timestamp: number;
  origSz: string;
  cloid?: string;
}

/**
 * Hook to fetch user open orders from Hyperliquid
 */
export function useUserOrders() {
  const { address, isConnected } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);
  const { setOpenOrders } = useOrdersStore();
  const { fetchAddress } = useTradingContext();

  const activeAddress = fetchAddress || address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-orders', activeAddress, network],
    queryFn: async () => {
      if (!activeAddress) return [];

      const client = getInfoClient(network);
      const openOrders = await client.getOpenOrders(activeAddress);
      return openOrders as HyperliquidOrder[];
    },
    enabled: isConnected && !!activeAddress,
    refetchInterval: 3000, // Refetch every 3 seconds
    staleTime: 1000,
  });

  // Update orders store with transformed data
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const transformedOrders = data.map((order: HyperliquidOrder) => ({
        id: order.oid.toString(),
        oid: order.oid,
        symbol: order.coin,
        side: (order.side === 'B' ? 'buy' : 'sell') as 'buy' | 'sell',
        type: 'limit' as const,
        price: order.limitPx,
        size: order.sz,
        filledSize: (parseFloat(order.origSz) - parseFloat(order.sz)).toFixed(4),
        status: 'open' as const,
        timestamp: order.timestamp,
      }));
      setOpenOrders(transformedOrders);
    }
  }, [data, setOpenOrders]);

  return {
    orders: data || [],
    isLoading,
    error,
    refetch,
  };
}
