'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { usePositionsStore } from '@/store/positions-store';
import { useTradingContext } from '@/hooks/use-trading-context';

/**
 * Hook to fetch user positions from Hyperliquid
 */
export function useUserPositions() {
  const { address, isConnected } = useAccount();
  const network = useNetworkStore((state) => state.network);
  const { setPositions } = usePositionsStore();
  const { fetchAddress } = useTradingContext();

  const activeAddress = fetchAddress || address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-positions', activeAddress, network],
    queryFn: async () => {
      if (!activeAddress) return null;

      const client = getInfoClient(network);
      const userState = await client.getUserState(activeAddress);
      return userState;
    },
    enabled: isConnected && !!activeAddress,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000,
  });

  // Update positions store
  useEffect(() => {
    if (data?.assetPositions) {
      const positions = data.assetPositions
        .filter((pos) => parseFloat(pos.position.szi) !== 0)
        .map((pos) => {
          const size = parseFloat(pos.position.szi);
          const entryPrice = parseFloat(pos.position.entryPx || '0');
          const leverage = pos.position.leverage.value; // Already a number
          const unrealizedPnl = parseFloat(pos.position.unrealizedPnl || '0');
          // Calculate margin used (position value / leverage)
          const positionValue = Math.abs(size) * entryPrice;
          const marginUsed = leverage > 0 ? positionValue / leverage : 0;

          return {
            symbol: pos.position.coin,
            side: size > 0 ? ('long' as const) : ('short' as const),
            size: Math.abs(size).toString(),
            entryPrice: entryPrice.toString(),
            markPrice: pos.position.positionValue || entryPrice.toString(),
            liquidationPrice: pos.position.liquidationPx || undefined,
            leverage: leverage,
            unrealizedPnl: unrealizedPnl.toString(),
            unrealizedPnlPercent: entryPrice > 0 ? ((unrealizedPnl / (Math.abs(size) * entryPrice)) * 100).toString() : '0',
            margin: marginUsed.toString(),
          };
        });

      setPositions(positions);
    }
  }, [data, setPositions]);

  return {
    positions: data?.assetPositions || [],
    isLoading,
    error,
    refetch,
  };
}
