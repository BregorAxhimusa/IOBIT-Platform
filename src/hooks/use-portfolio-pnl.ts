'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppKitAccount } from '@reown/appkit/react';
import { getInfoClient } from '@/lib/hyperliquid/info-client';
import { useNetworkStore } from '@/store/network-store';
import type { UserFill, FundingPayment, PnLData, PerformanceStats } from '@/lib/hyperliquid/types';

type TimeRange = '24h' | '7d' | '30d' | '90d' | 'all';

function getStartTime(range: TimeRange): number {
  const now = Date.now();
  switch (range) {
    case '24h': return now - 24 * 60 * 60 * 1000;
    case '7d': return now - 7 * 24 * 60 * 60 * 1000;
    case '30d': return now - 30 * 24 * 60 * 60 * 1000;
    case '90d': return now - 90 * 24 * 60 * 60 * 1000;
    case 'all': return 0;
  }
}

/**
 * Fetch all fills with pagination (max 500 per request)
 */
async function fetchAllFills(
  address: string,
  startTime: number,
  network: 'mainnet' | 'testnet'
): Promise<UserFill[]> {
  const client = getInfoClient(network);
  const allFills: UserFill[] = [];
  let currentStart = startTime;
  const endTime = Date.now();

  while (currentStart < endTime) {
    const fills = await client.getUserFillsByTime(address, currentStart, endTime);
    if (fills.length === 0) break;

    allFills.push(...fills);

    // If less than 500 results, we got everything
    if (fills.length < 500) break;

    // Paginate: use last fill's time + 1ms as next startTime
    currentStart = fills[fills.length - 1].time + 1;
  }

  return allFills;
}

/**
 * Fetch all funding payments with pagination
 */
async function fetchAllFunding(
  address: string,
  startTime: number,
  network: 'mainnet' | 'testnet'
): Promise<FundingPayment[]> {
  const client = getInfoClient(network);
  const allFunding: FundingPayment[] = [];
  let currentStart = startTime;
  const endTime = Date.now();

  while (currentStart < endTime) {
    const funding = await client.getUserFunding(address, currentStart, endTime);
    if (funding.length === 0) break;

    allFunding.push(...funding);

    if (funding.length < 500) break;
    currentStart = funding[funding.length - 1].time + 1;
  }

  return allFunding;
}

/**
 * Aggregate fills and funding into daily PnL data
 */
function aggregatePnLData(fills: UserFill[], funding: FundingPayment[]): PnLData[] {
  const dailyMap = new Map<string, {
    realizedPnl: number;
    fundingPnl: number;
    trades: number;
    volume: number;
    fees: number;
  }>();

  // Aggregate fills by day
  for (const fill of fills) {
    const date = new Date(fill.time).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || {
      realizedPnl: 0, fundingPnl: 0, trades: 0, volume: 0, fees: 0,
    };

    existing.realizedPnl += parseFloat(fill.closedPnl);
    existing.trades += 1;
    existing.volume += parseFloat(fill.px) * parseFloat(fill.sz);
    existing.fees += parseFloat(fill.fee);

    dailyMap.set(date, existing);
  }

  // Aggregate funding by day
  for (const payment of funding) {
    const date = new Date(payment.time).toISOString().split('T')[0];
    const existing = dailyMap.get(date) || {
      realizedPnl: 0, fundingPnl: 0, trades: 0, volume: 0, fees: 0,
    };

    existing.fundingPnl += parseFloat(payment.usdc);
    dailyMap.set(date, existing);
  }

  // Sort by date and calculate cumulative PnL
  const sortedDates = [...dailyMap.keys()].sort();
  let cumulativePnl = 0;

  return sortedDates.map((date) => {
    const day = dailyMap.get(date)!;
    const totalPnl = day.realizedPnl + day.fundingPnl;
    cumulativePnl += totalPnl;

    return {
      date,
      realizedPnl: day.realizedPnl,
      fundingPnl: day.fundingPnl,
      totalPnl,
      cumulativePnl,
      trades: day.trades,
      volume: day.volume,
      fees: day.fees,
    };
  });
}

/**
 * Calculate performance statistics from fills
 */
function calculatePerformanceStats(
  fills: UserFill[],
  funding: FundingPayment[]
): PerformanceStats {
  const closingFills = fills.filter((f) => parseFloat(f.closedPnl) !== 0);

  const winningTrades = closingFills.filter((f) => parseFloat(f.closedPnl) > 0);
  const losingTrades = closingFills.filter((f) => parseFloat(f.closedPnl) < 0);

  const totalWins = winningTrades.reduce((sum, f) => sum + parseFloat(f.closedPnl), 0);
  const totalLosses = Math.abs(
    losingTrades.reduce((sum, f) => sum + parseFloat(f.closedPnl), 0)
  );

  const totalRealizedPnl = fills.reduce((sum, f) => sum + parseFloat(f.closedPnl), 0);
  const totalFunding = funding.reduce((sum, f) => sum + parseFloat(f.usdc), 0);
  const totalFees = fills.reduce((sum, f) => sum + parseFloat(f.fee), 0);
  const totalVolume = fills.reduce(
    (sum, f) => sum + parseFloat(f.px) * parseFloat(f.sz),
    0
  );

  return {
    totalTrades: fills.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: closingFills.length > 0
      ? (winningTrades.length / closingFills.length) * 100
      : 0,
    avgWin: winningTrades.length > 0
      ? totalWins / winningTrades.length
      : 0,
    avgLoss: losingTrades.length > 0
      ? totalLosses / losingTrades.length
      : 0,
    largestWin: winningTrades.length > 0
      ? Math.max(...winningTrades.map((f) => parseFloat(f.closedPnl)))
      : 0,
    largestLoss: losingTrades.length > 0
      ? Math.min(...losingTrades.map((f) => parseFloat(f.closedPnl)))
      : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0,
    totalRealizedPnl,
    totalFunding,
    totalFees,
    netPnl: totalRealizedPnl + totalFunding - totalFees,
    totalVolume,
    avgTradeSize: fills.length > 0 ? totalVolume / fills.length : 0,
  };
}

/**
 * Hook for real portfolio PnL data with time range support
 */
export function usePortfolioPnL(timeRange: TimeRange = '30d') {
  const { address, isConnected } = useAppKitAccount();
  const network = useNetworkStore((state) => state.network);

  const startTime = getStartTime(timeRange);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portfolio-pnl', address, network, timeRange],
    queryFn: async () => {
      if (!address) return null;

      // Fetch fills and funding in parallel
      const [fills, funding] = await Promise.all([
        fetchAllFills(address, startTime, network),
        fetchAllFunding(address, startTime, network),
      ]);

      // Aggregate PnL data by day
      const pnlData = aggregatePnLData(fills, funding);

      // Calculate performance stats
      const stats = calculatePerformanceStats(fills, funding);

      return {
        pnlData,
        stats,
        fills,
        funding,
      };
    },
    enabled: isConnected && !!address,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });

  return {
    pnlData: data?.pnlData || [],
    stats: data?.stats || null,
    fills: data?.fills || [],
    funding: data?.funding || [],
    isLoading,
    error,
    refetch,
  };
}
