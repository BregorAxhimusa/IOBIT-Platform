'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';

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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['account-balance', address, network],
    queryFn: async () => {
      if (!address) return null;

      const client = getInfoClient(network);
      const userState = await client.getUserState(address);

      if (!userState) return null;

      // Extract margin summary
      const marginSummary = userState.marginSummary;

      // Parse values
      const accountValue = parseFloat(marginSummary.accountValue);
      const totalRawUsd = parseFloat(marginSummary.totalRawUsd);
      const totalNtlPos = parseFloat(marginSummary.totalNtlPos);
      const totalMarginUsed = parseFloat(marginSummary.totalMarginUsed);

      // Calculate withdrawable (account value - margin used)
      const withdrawable = Math.max(0, accountValue - totalMarginUsed);

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
    enabled: isConnected && !!address,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 1000,
  });

  return {
    balance: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for calculating portfolio statistics
 */
export function usePortfolioStats() {
  const { balance } = useAccountBalance();
  const { address } = useAccount();

  // For now, we'll calculate PnL based on current unrealized PnL
  // In the future, we can fetch historical data from database
  const totalUnrealizedPnl = balance?.assetPositions.reduce((sum, pos) => {
    return sum + parseFloat(pos.position.unrealizedPnl || '0');
  }, 0) || 0;

  // Mock historical PnL for now (would come from database snapshots)
  // TODO: Implement real historical PnL from position snapshots
  const dailyPnl = totalUnrealizedPnl * 0.1; // Estimate
  const weeklyPnl = totalUnrealizedPnl * 0.5; // Estimate
  const monthlyPnl = totalUnrealizedPnl; // Current unrealized

  return {
    accountValue: balance?.accountValue || 0,
    availableBalance: balance?.withdrawable || 0,
    totalMargin: balance?.totalMarginUsed || 0,
    totalUnrealizedPnl,
    dailyPnl,
    weeklyPnl,
    monthlyPnl,
    isLoading: !balance && !!address,
  };
}
