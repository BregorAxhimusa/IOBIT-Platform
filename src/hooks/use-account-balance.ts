'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import { useTradingContext } from '@/hooks/use-trading-context';

export interface AccountBalance {
  // Account Value
  accountValue: number;
  totalRawUsd: number;
  totalNtlPos: number;
  totalMarginUsed: number;

  // Withdrawable
  withdrawable: number;

  // Cross Margin Summary
  crossMarginSummary: {
    accountValue: string;
    totalMarginUsed: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };

  // Asset Positions (USDC balance, etc)
  assetPositions: Array<{
    position: {
      coin: string;
      entryPx: string | null;
      leverage: {
        type: string;
        value: number;
      };
      liquidationPx: string | null;
      marginUsed: string;
      maxLeverage: number;
      positionValue: string;
      returnOnEquity: string;
      szi: string;
      unrealizedPnl: string;
    };
    type: string;
  }>;
}

/**
 * Hook for fetching real account balance and margin data from Hyperliquid
 */
export function useAccountBalance() {
  const { address, isConnected } = useAccount();
  const network = useNetworkStore((state) => state.network);
  const { fetchAddress } = useTradingContext();

  const activeAddress = fetchAddress || address;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['account-balance', activeAddress, network],
    queryFn: async () => {
      if (!activeAddress) return null;

      const client = getInfoClient(network);
      const userState = await client.getUserState(activeAddress);

      if (!userState) return null;

      // Extract margin summary
      const marginSummary = userState.marginSummary;

      // Parse values
      const accountValue = parseFloat(marginSummary.accountValue);
      const totalRawUsd = parseFloat(marginSummary.totalRawUsd);
      const totalNtlPos = parseFloat(marginSummary.totalNtlPos);
      const totalMarginUsed = parseFloat(marginSummary.totalMarginUsed);

      // Use API's withdrawable field directly (more accurate than manual calculation)
      const withdrawable = parseFloat(userState.withdrawable || '0');

      return {
        accountValue,
        totalRawUsd,
        totalNtlPos,
        totalMarginUsed,
        withdrawable,
        crossMarginSummary: marginSummary,
        assetPositions: userState.assetPositions || [],
      } as AccountBalance;
    },
    enabled: isConnected && !!activeAddress,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 1000,
  });

  // Create simplified balance object with USDC
  const simpleBalance = data ? {
    usdc: data.withdrawable.toFixed(2),
    spot: data.withdrawable.toFixed(2),
    perps: data.accountValue.toFixed(2),
  } : null;

  return {
    balance: simpleBalance,
    fullBalance: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for calculating portfolio statistics
 */
export function usePortfolioStats() {
  const { fullBalance } = useAccountBalance();
  const { address } = useAccount();

  // For now, we'll calculate PnL based on current unrealized PnL
  // In the future, we can fetch historical data from database
  const totalUnrealizedPnl = fullBalance?.assetPositions.reduce((sum, pos) => {
    return sum + parseFloat(pos.position.unrealizedPnl || '0');
  }, 0) || 0;

  // Mock historical PnL for now (would come from database snapshots)
  // TODO: Implement real historical PnL from position snapshots
  const dailyPnl = totalUnrealizedPnl * 0.1; // Estimate
  const weeklyPnl = totalUnrealizedPnl * 0.5; // Estimate
  const monthlyPnl = totalUnrealizedPnl; // Current unrealized

  return {
    accountValue: fullBalance?.accountValue || 0,
    availableBalance: fullBalance?.withdrawable || 0,
    totalMargin: fullBalance?.totalMarginUsed || 0,
    totalUnrealizedPnl,
    dailyPnl,
    weeklyPnl,
    monthlyPnl,
    isLoading: !fullBalance && !!address,
  };
}
